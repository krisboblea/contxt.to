import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { AiButtons } from '@/components/shared/ai-buttons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContextView {
  slug: string
  title: string
  summary: string
  content: string
  tags: string[]
  createdAt: Date
}

export function BrowserContextPage({ context, url }: { context: ContextView; url: string }) {
  const date = new Date(context.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>contxt.to</span>
          <span>·</span>
          <time dateTime={new Date(context.createdAt).toISOString()}>{date}</time>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-3">
          {context.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-4">{context.summary}</p>
        {context.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {context.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Context</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {context.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* AI actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">
            Continue the conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Open this context in your favorite AI assistant to continue
            the discussion.
          </p>
          <AiButtons url={url} />
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t">
        <p>contxt.to — share knowledge in one link</p>
      </footer>
    </main>
  )
}
