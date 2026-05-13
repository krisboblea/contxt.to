import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { slugify, randomSuffix } from "@/lib/utils"
import { randomBytes } from "crypto"

const bodySchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(10).max(500),
  content: z.string().min(10).max(50000),
  tags: z.array(z.string()).optional(),
})

async function findUniqueSlug(base: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = `${slugify(base)}-${randomSuffix()}`
    const existing = await prisma.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  return `${slugify(base)}-${randomBytes(4).toString("hex")}`
}

export async function POST(request: NextRequest) {
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

  const { title, summary, content, tags } = parsed.data
  const slug = await findUniqueSlug(title)
  const claimToken = randomBytes(16).toString("hex")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://contxt.to"

  await prisma.context.create({
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
