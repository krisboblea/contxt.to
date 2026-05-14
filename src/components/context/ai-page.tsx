interface AIContext {
  title: string
  summary: string
  content: string
}

export function AIContextPage({ context }: { context: AIContext }) {
  const yaml = [
    "---",
    `name: ${context.title}`,
    `description: ${context.summary}`,
    "---",
    "",
    context.content,
  ].join("\n")

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {yaml}
      </pre>
    </main>
  )
}
