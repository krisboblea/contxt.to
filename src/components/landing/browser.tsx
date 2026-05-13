import { CreateForm } from './create-form'

export async function LandingBrowser() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-4">
          Share knowledge in{' '}
          <span className="italic text-[#E8285F]">one link</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Create a shareable link for any knowledge. Your recipients can read the
          full context and continue the conversation in ChatGPT, Gemini, or
          Claude.
        </p>

        {/* Create form */}
        <div className="max-w-lg mx-auto text-left">
          <CreateForm />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="font-semibold mb-2">Write your context</h3>
              <p className="text-sm text-muted-foreground">
                Paste your knowledge — notes, analysis, documentation, anything.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-semibold mb-2">Get a short link</h3>
              <p className="text-sm text-muted-foreground">
                We generate a unique URL instantly. Share it anywhere.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2">Continue in AI</h3>
              <p className="text-sm text-muted-foreground">
                Recipients open the link and continue in ChatGPT, Gemini, or
                Claude.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>contxt.to — share knowledge in one link</p>
      </footer>
    </main>
  )
}
