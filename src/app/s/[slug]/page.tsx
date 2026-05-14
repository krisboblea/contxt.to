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

  const host = h.get("x-forwarded-host") || h.get("host") || "contxt.to"
  const proto = h.get("x-forwarded-proto") || "https"
  const url = `${proto}://${host}/s/${slug}`

  const db = await getPrismaClient()
  if (!db) notFound()
  const raw = await db.context.findUnique({ where: { slug } })
  if (!raw) notFound()

  if (visitorType === "ai_agent") {
    return (
      <AIContextPage
        context={{
          title: raw.title,
          summary: raw.summary,
          content: raw.content,
        }}
      />
    )
  }

  return (
    <BrowserContextPage
      context={{
        title: raw.title,
        summary: raw.summary,
        content: raw.content,
      }}
      url={url}
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
