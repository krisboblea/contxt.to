import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getPrismaClient } from "@/lib/prisma"
import { BrowserContextPage } from "@/components/context/browser-page"
import { AIContextPage } from "@/components/context/ai-page"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ContextPage({ params }: Props) {
  const { slug } = await params
  const h = await headers()
  const visitorType = h.get("x-visitor-type") ?? "browser"

  const db = await getPrismaClient()
  if (!db) notFound()
  const raw = await db.context.findUnique({ where: { slug } })
  if (!raw) notFound()

  const tags = JSON.parse(raw.tags) as string[]

  if (visitorType === "ai_agent") {
    return (
      <AIContextPage
        context={{
          slug: raw.slug,
          title: raw.title,
          summary: raw.summary,
          content: raw.content,
          tags,
          createdAt: raw.createdAt,
          claimToken: raw.claimToken,
        }}
      />
    )
  }

  return (
    <BrowserContextPage
      context={{
        slug: raw.slug,
        title: raw.title,
        summary: raw.summary,
        content: raw.content,
        tags,
        createdAt: raw.createdAt,
      }}
    />
  )
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const db = await getPrismaClient()
  if (!db) return { title: "Not Found — contxt.to" }
  const context = await db.context.findUnique({ where: { slug } })
  if (!context) return { title: "Not Found — contxt.to" }
  return {
    title: `${context.title} — contxt.to`,
    description: context.summary,
    openGraph: {
      title: `${context.title} — contxt.to`,
      description: context.summary,
    },
  }
}
