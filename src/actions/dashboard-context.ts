"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { getPrismaClient } from "@/lib/prisma"
import { generateSlug, shortCode } from "@/lib/utils"

export type DashboardContext = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  tags: string
  createdAt: string
  updatedAt: string
}

async function findUniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug(base)
    const existing = await db.context.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }
  const fallback = shortCode(8)
  const exists = await db.context.findUnique({ where: { slug: fallback } })
  if (!exists) return fallback
  return shortCode(12)
}

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session
}

export async function getUserContexts(q?: string): Promise<DashboardContext[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const db = await getPrismaClient()
  if (!db) return []

  const where: Record<string, unknown> = { userId: session.user.id }
  if (q && q.trim()) {
    const search = q.trim()
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const rows = await db.context.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return rows.map((r: { id: string; title: string; slug: string; summary: string; content: string; tags: string; createdAt: Date; updatedAt: Date }) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))
}

export async function getUserContext(id: string): Promise<DashboardContext | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const db = await getPrismaClient()
  if (!db) return null

  const row = await db.context.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!row) return null

  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createUserContext(data: {
  title: string
  summary: string
  content: string
  tags?: string
}): Promise<{ success: true; slug: string } | { success: false; error: string }> {
  try {
    const session = await getSession()
    const db = await getPrismaClient()
    if (!db) return { success: false, error: "Database unavailable" }

    const slug = await findUniqueSlug(db, data.title)
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : []

    await db.context.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        tags: JSON.stringify(tags),
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard")
    return { success: true, slug }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to create context" }
  }
}

export async function updateContext(
  id: string,
  data: { title: string; summary: string; content: string; tags?: string }
): Promise<{ slug: string }> {
  const session = await getSession()
  const db = await getPrismaClient()
  if (!db) throw new Error("Database unavailable")

  const existing = await db.context.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) throw new Error("Not found")

  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const updated = await db.context.update({
    where: { id },
    data: {
      title: data.title,
      summary: data.summary,
      content: data.content,
      tags: JSON.stringify(tags),
    },
  })

  revalidatePath(`/s/${updated.slug}`)
  revalidatePath("/dashboard")
  return { slug: updated.slug }
}

export async function deleteContext(id: string): Promise<void> {
  const session = await getSession()
  const db = await getPrismaClient()
  if (!db) throw new Error("Database unavailable")

  const existing = await db.context.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) throw new Error("Not found")

  await db.context.delete({ where: { id } })
  revalidatePath("/dashboard")
}
