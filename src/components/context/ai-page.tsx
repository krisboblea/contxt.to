interface AIContext {
  slug: string
  title: string
  summary: string
  content: string
  tags: string[]
  createdAt: Date
  claimToken: string | null
}

function formatDate(d: Date): string {
  return d.toISOString()
}

export function AIContextPage({ context }: { context: AIContext }) {
  const tagsYaml = context.tags.length > 0
    ? `tags: [${context.tags.map(t => `"${t}"`).join(", ")}]`
    : "tags: []"

  const yaml = [
    "---",
    `name: ${context.title}`,
    `description: ${context.summary}`,
    tagsYaml,
    `slug: ${context.slug}`,
    `created: ${formatDate(context.createdAt)}`,
    context.claimToken ? `claim_token: ${context.claimToken}` : null,
    "---",
    "",
    context.content,
  ].filter(Boolean).join("\n")

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {yaml}
      </pre>
    </main>
  )
}
