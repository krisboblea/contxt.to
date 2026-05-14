"use server"

import { getPrismaClient } from "@/lib/prisma"
import { generateSlug, shortCode } from "@/lib/utils"
import { randomBytes } from "crypto"
import { createContextSchema as contextSchema, type CreateContextForm as ContextFormData } from "@/lib/schemas"
import { headers } from "next/headers"

type CreateContextResult =
  | { success: true; slug: string; claimToken: string; url: string }
  | { success: false; error: string }

function parseTags(raw?: string): string[] {
  if (!raw?.trim()) return []
  return raw.split(",").map((t) => t.trim()).filter(Boolean)
}

async function findUniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug(base)
    const existing = await db.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  const fallback = shortCode(8)
  const existing = await db.context.findUnique({ where: { slug: fallback } })
  if (!existing) return fallback
  for (let i = 0; i < 20; i++) {
    const code = shortCode(12)
    const exists = await db.context.findUnique({ where: { slug: code } })
    if (!exists) return code
  }
  throw new Error("Unable to generate unique slug after exhausting all attempts")
}

async function getBaseUrl(): Promise<string> {
  // 1. Env var takes priority (set for production)
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  // 2. Fall back to current request hostname (auto-adapts preview)
  try {
    const h = await headers()
    const host = h.get("host") || "contxt.to"
    const proto = h.get("x-forwarded-proto") || "https"
    return `${proto}://${host}`
  } catch {
    return "https://contxt.to"
  }
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
  const url = `${await getBaseUrl()}/s/${slug}`

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

    return { success: true, slug, claimToken, url }
  } catch (e: any) {
    console.error("createContext error:", e)
    return { success: false, error: e?.message ?? "Failed to create context" }
  }
}
