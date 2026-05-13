interface AIContext {
  slug: string
  title: string
  summary: string
  content: string
  tags: string[]
  createdAt: Date
  claimToken: string | null
}

export function AIContextPage({ context }: { context: AIContext }) {
  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">{context.title}</h1>
      <p className="text-base text-muted-foreground mb-6">
        {context.summary}
      </p>

      <hr className="border-border mb-6" />

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {context.content}
        </pre>
      </div>

      {context.tags && context.tags.length > 0 && (
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <strong>Tags:</strong> {context.tags.join(', ')}
        </div>
      )}

      <hr className="border-border my-8" />

      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          This context was shared via{' '}
          <a
            href={`https://contxt.to/s/${context.slug}`}
            className="underline underline-offset-2"
          >
            contxt.to/s/{context.slug}
          </a>
        </p>
        {context.claimToken && (
          <p className="text-xs">
            Claim token (for claiming this link): {context.claimToken}
          </p>
        )}
      </div>
    </main>
  )
}
