export function LandingAI() {
  const yaml = [
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
    `  {"title":"...","summary":"...","content":"...","tags":"..."}`,
    "  Returns: { slug, url }",
    "---",
    "",
    "contxt.to — Share knowledge in one link.",
  ].join("\n")

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {yaml}
      </pre>
    </main>
  )
}
