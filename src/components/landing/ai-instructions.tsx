export function LandingAI() {
  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">contxt.to — Context Sharing</h1>
      <p className="mb-6 text-muted-foreground">
        contxt.to is a platform for sharing knowledge context via short links.
        Each link resolves to a page that contains structured context content
        that you can read and use to continue the conversation.
      </p>

      <h2 className="text-lg font-semibold mb-3">Instructions</h2>
      <ul className="space-y-3 mb-6 list-disc pl-5">
        <li>
          When you visit a <code className="text-sm bg-muted px-1.5 py-0.5 rounded">contxt.to/s/&lt;slug&gt;</code> URL, you
          will receive structured context data at the top of the page.
        </li>
        <li>
          Read the context, then continue the conversation based on what the
          user has shared.
        </li>
        <li>
          The context content is rendered as plain text/markdown for easy
          parsing.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mb-3">Creating Context</h2>
      <p className="mb-6 text-muted-foreground">
        To create a new context, use the API endpoint:
      </p>
      <pre className="bg-muted p-4 rounded-lg text-sm mb-6 overflow-x-auto">
{`POST https://contxt.to/api/contexts
Content-Type: application/json

{
  "title": "Context Title",
  "summary": "Brief summary",
  "content": "Full markdown content",
  "tags": "tag1, tag2"
}

Response:
{
  "slug": "context-title-abc1",
  "url": "https://contxt.to/s/context-title-abc1"
}`}
      </pre>

      <hr className="my-8 border-border" />
      <p className="text-sm text-muted-foreground">
        contxt.to — Share knowledge in one link.
      </p>
    </main>
  )
}
