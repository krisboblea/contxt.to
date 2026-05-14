import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

export const runtime = "nodejs"

function formatDate(d: Date): string {
  return d.toISOString()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const db = await getPrismaClient()
  if (!db) {
    return new NextResponse("Database unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const raw = await db.context.findUnique({ where: { slug } })
  if (!raw) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const tags: string[] = JSON.parse(raw.tags)
  const tagsYaml =
    tags.length > 0
      ? `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`
      : "tags: []"

  const body = [
    "---",
    `name: ${raw.title}`,
    `description: ${raw.summary}`,
    tagsYaml,
    `slug: ${raw.slug}`,
    `created: ${formatDate(raw.createdAt)}`,
    raw.claimToken ? `claim_token: ${raw.claimToken}` : null,
    "---",
    "",
    raw.content,
  ]
    .filter(Boolean)
    .join("\n")

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
