"use server"

import { z } from "zod"
import { getPrismaClient } from "@/lib/prisma"
import { slugify, randomSuffix } from "@/lib/utils"
import { randomBytes } from "crypto"

export const contextSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(500),
  content: z.string().min(10, "Content must be at least 10 characters").max(50000),
  tags: z.string().optional(),
})

export type ContextFormData = z.infer<typeof contextSchema>

type CreateContextResult =
  | { success: true; slug: string; claimToken: string }
  | { success: false; error: string }

async function findUniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = `${slugify(base)}-${randomSuffix()}`
    const existing = await db.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  return `${slugify(base)}-${randomBytes(4).toString("hex")}`
}

function parseTags(raw?: string): string[] {
  if (!raw?.trim()) return []
  return raw.split(",").map((t) => t.trim()).filter(Boolean)
}

export async function createContext(data: ContextFormData): Promise<CreateContextResult> {
  const parsed = contextSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" }
  }

  const db = await getPrismaClient()
  if (!db) {
    return { success: false, error: "Database unavailable — preview mode" }
  }

  const { title, summary, content, tags } = parsed.data
  const slug = await findUniqueSlug(db, title)
  const claimToken = randomBytes(16).toString("hex")

  try {
    await db.context.create({
      data: {
        title,
        slug,
        summary,
        content,
        tags: JSON.stringify(parseTags(tags)),
        claimToken,
        creatorIp: null,
      },
    })
    return { success: true, slug, claimToken }
  } catch (err) {
    console.error("createContext error", err)
    return { success: false, error: "Failed to create context" }
  }
}

export async function getContext(slug: string) {
  const db = await getPrismaClient()
  if (!db) return null

  const raw = await db.context.findUnique({ where: { slug } })
  if (!raw) return null
  return {
    ...raw,
    tags: JSON.parse(raw.tags) as string[],
  }
}
