import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPrismaClient } from "@/lib/prisma"
import { generateSlug, shortCode } from "@/lib/utils"
import { randomBytes } from "crypto"
import { withRateLimit } from "@/lib/rate-limit"

const bodySchema = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().min(10).max(500),
  content: z.string().min(10).max(50000),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

async function findUniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug(base)
    const existing = await db.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  return shortCode(8)
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
  const slug = await findUniqueSlug(db, title)
  const claimToken = randomBytes(16).toString("hex")
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "contxt.to"
  const proto = request.headers.get("x-forwarded-proto") || "https"
  const baseUrl = `${proto}://${host}`

  await db.context.create({
    data: {
      title,
      slug,
      summary,
      content,
      tags: JSON.stringify(tags ?? []),
      claimToken,
      creatorIp: request.headers.get("x-forwarded-for") ?? null,
    },
  })

  return NextResponse.json({ slug, url: `${baseUrl}/s/${slug}` }, { status: 201 })
}
