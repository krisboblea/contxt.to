import { NextResponse } from "next/server"

export const runtime = "nodejs"

const body = [
  "---",
  "name: contxt",
  "description: >",
  "  Context-sharing short link platform. Create and share knowledge",
  "  context via short URLs. Each link resolves to structured content",
  "  that AI agents can read and act upon.",
  "instructions: >",
  "  When visiting contxt.to/s/<slug>, you will receive structured",
  "  context data with title, summary, tags, and full content. Read the",
  "  context and continue the conversation based on what the user shared.",
  "api_endpoint: |",
  "  POST /api/contexts",
  "  Content-Type: application/json",
  '  {"title":"...","summary":"...","content":"...","tags":"..."}',
  "  Returns: { slug, url }",
  "---",
  "",
  "contxt.to — Share knowledge in one link.",
].join("\n")

export function GET() {
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
