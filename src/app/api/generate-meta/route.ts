import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

const SYSTEM_PROMPT = `You are a metadata generator. Given content below, generate a title (max 10 words) and a one-sentence summary (max 25 words). Return valid JSON only: {"title":"...","summary":"..."}. Title must be under 10 words, summary under 25 words.`

export async function POST(request: NextRequest) {
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

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nContent:\n${trimmed}`
    const { stdout } = await execFileAsync("gemini", ["-p", prompt, "--output-format", "json"], {
      timeout: 60000,
      maxBuffer: 1024 * 10,
      env: { ...process.env, TERM: "dumb", NO_COLOR: "1" },
    })

    // Parse JSON from output
    const lines = stdout.split("\n").filter(l => l.trim().startsWith("{"))
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line.trim())
        if (parsed.title && parsed.summary) {
          return NextResponse.json({
            title: String(parsed.title).trim().slice(0, 120),
            summary: String(parsed.summary).trim().slice(0, 500),
          })
        }
      } catch {}
    }

    throw new Error("Could not parse AI response")
  } catch (err) {
    console.error("generate-meta error:", err)

    // Fallback: smart extraction
    const text = trimmed.replace(/\n+/g, " ").trim()
    // Title: first sentence or first line, max 10 words
    const firstSentence = text.match(/^.*?[\.!?](\s|$)/)?.[0]?.trim() || text
    const title = firstSentence.split(/\s+/).slice(0, 10).join(" ").replace(/\.$/, "").trim() || "Shared Context"
    // Summary: first 2-3 sentences, max 25 words
    const sentences = text.match(/[^.!?]+[\.!?]+/g) || [text]
    const summaryWords: string[] = []
    for (const s of sentences) {
      const words = s.trim().split(/\s+/)
      if (summaryWords.length + words.length > 25) break
      summaryWords.push(...words)
    }
    const summary = summaryWords.join(" ").trim() || firstSentence

    return NextResponse.json({ title, summary, source: "extraction" })
  }
}
