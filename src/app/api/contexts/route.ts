import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPrismaClient } from "@/lib/prisma"
import { generateSlug, shortCode } from "@/lib/utils"
import { randomBytes } from "crypto"
import { withRateLimit } from "@/lib/rate-limit"

const tagsSchema = z.union([
  z.string().max(200),
  z.array(z.string().max(50)).max(2),
]).optional()

const bodySchema = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().min(10).max(500),
  content: z.string().min(10).max(50000),
  tags: tagsSchema,
})

function normalizeTags(tags: string | string[] | undefined): string {
  if (!tags) return "[]"
  if (Array.isArray(tags)) return JSON.stringify(tags.map(t => t.trim()).filter(Boolean))
  // Comma-separated string
  return JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean))
}

async function findUniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug(base)
    const existing = await db.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  // Final fallback: verify uniqueness
  const fallback = shortCode(8)
  const existing = await db.context.findUnique({ where: { slug: fallback } })
  if (!existing) return fallback
  // Extremely unlikely, but keep trying with random codes
  for (let i = 0; i < 20; i++) {
    const code = shortCode(12)
    const exists = await db.context.findUnique({ where: { slug: code } })
    if (!exists) return code
  }
  throw new Error("Unable to generate unique slug after exhausting all attempts")
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per 60 seconds per IP
  const rateLimited = withRateLimit(request, null, { max: 10, windowSeconds: 60 })
  if (rateLimited.status === 429) return rateLimited

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const db = await getPrismaClient()
  if (!db) {
    return NextResponse.json({ error: "Database unavailable — preview mode" }, { status: 503 })
  }

  const { title, summary, content, tags } = parsed.data

  try {
    const slug = await findUniqueSlug(db, title)
    const claimToken = randomBytes(16).toString("hex")
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host") || "contxt.to"}`

    await db.context.create({
      data: {
        title,
        slug,
        summary,
        content,
        tags: normalizeTags(tags),
        claimToken,
        creatorIp: request.headers.get("x-forwarded-for") ?? null,
      },
    })

    return NextResponse.json({ slug, claimToken, url: `${baseUrl}/s/${slug}` }, { status: 201 })
  } catch (e) {
    console.error('[contexts] DB error:', e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
