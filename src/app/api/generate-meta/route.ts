import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit"

/**
 * Smart extraction: derive title + summary from raw text without an LLM.
 * Reliable, fast, works everywhere (Vercel serverless included).
 */
function extractMetadata(text: string) {
  const clean = text.replace(/\n+/g, " ").trim()

  // Find sentence boundaries
  const sentences = clean.match(/[^.!?]+[\.!?]+/g) || [clean]

  // Title: first sentence, max 12 words
  const firstSentence = sentences[0]?.trim() || clean
  const title = firstSentence
    .split(/\s+/)
    .slice(0, 12)
    .join(" ")
    .replace(/\.$/, "")
    .trim() || "Shared Context"

  // Summary: first 2-3 sentences, max 30 words
  const summaryWords: string[] = []
  for (const s of sentences) {
    const words = s.trim().split(/\s+/)
    if (summaryWords.length + words.length > 30) break
    summaryWords.push(...words)
  }
  const summary = summaryWords.join(" ").trim() || firstSentence

  return { title, summary, source: "extraction" as const }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per 60 seconds per IP
  const rateLimited = withRateLimit(request, null, { max: 5, windowSeconds: 60 })
  if (rateLimited.status === 429) return rateLimited

  let body: { content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.content || typeof body.content !== "string" || body.content.trim().length < 10) {
    return NextResponse.json({ error: "Content must be at least 10 characters" }, { status: 400 })
  }

  const trimmed = body.content.trim().slice(0, 5000)
  const result = extractMetadata(trimmed)

  return NextResponse.json(result)
}
