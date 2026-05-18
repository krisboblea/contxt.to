<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/redirhub/contxt.to/oss/public/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/redirhub/contxt.to/oss/public/logo-light.svg" width="180" alt="Contxt">
  </picture>
  <br/>
  <br/>

  <h3>Share knowledge in one link.</h3>

  <p align="center">
    <strong>Context sharing for AI and humans.</strong>
    <br/>
    Paste knowledge → get a short link. Humans see a rich page. AI agents see clean structured data. Same URL, two rendering paths.
  </p>

  <br/>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#api">API</a> •
    <a href="#stack">Stack</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <br/>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
    <img src="https://img.shields.io/github/stars/redirhub/contxt.to" alt="Stars">
  </p>

  <br/>
</div>

---

## The Problem

Knowledge lives in Slack threads, meeting transcripts, Figma files, and RFCs. The hardest part of every conversation is getting everyone up to speed. And when someone finally shares context, the recipient has to re-format it for whatever tool they use next.

AI agents can't read your Notion doc. ChatGPT doesn't see your Slack history. Gemini doesn't know what you discussed in that meeting.

**Context gets lost. Conversations start from zero. Every time.**

---

## The Solution

**Contxt is a single link that serves both humans and AI.**

Paste your knowledge — analysis, RFC, meeting recap, research brief — and get a short URL. Share it anywhere. When someone opens it:

- **Humans** see a rich card with title, summary, full markdown, and buttons to continue in ChatGPT, Gemini, or Claude.
- **AI agents** (ChatGPT, Gemini, Claude, curl) receive structured YAML — clean, no HTML/CSS noise, ready to continue the conversation with full context pre-loaded.

**One link. Two rendering paths. Zero friction.**

```
                ┌─ User-Agent: browser ──► Rich HTML page Continue in ChatGPT / Gemini / Claude
                │
  contxt.to/s/abc ──┤
                │
                └─ User-Agent: AI agent ──► Structured YAML (text/plain) name, description, content
```

---

## Features

- **Paste and share** — Enter content, get a short link. No account required.
- **AI-native** — Same link works in ChatGPT, Gemini, Claude, and any HTTP client. AI agents get machine-readable YAML automatically.
- **Private by default** — Nothing is public without you sharing the link. No indexing, no discovery.
- **Dual-render architecture** — Server-side user-agent detection serves the right format every time.
- **API-first** — Create contexts programmatically via `POST /api/contexts`.
- **Self-hostable** — Open source. MIT license. Your data, your infrastructure.

---

## Quick Start

```bash
git clone https://github.com/redirhub/contxt.to.git
cd contxt.to
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

Create a `.env.local` file based on `.env.example`:

| Variable | Required | Description |
|---|---|---|
| `TURSO_DB_URL` | Yes | Turso (libSQL) database URL |
| `TURSO_DB_AUTH_TOKEN` | Yes | Turso authentication token |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `AUTH_SECRET` | No | NextAuth encryption secret |
| `EMAIL_SERVER_URL` | No | SMTP URL for magic link emails |

### Running Tests

```bash
npm test               # Unit tests (Vitest)
npm run test:e2e       # E2E tests (Playwright)
npx tsc --noEmit       # Type check
npm run lint           # Lint
```

---

## How It Works

### Creating a Link

1. Go to [contxt.to](https://contxt.to) — or use the API.
2. Paste or write your content. Optionally provide a title.
3. Click **Create** — AI generates a title and summary from your content.
4. You get a short link: `contxt.to/s/quick-thought-kF3mQ`.

### Reading a Link

**As a human:** Open the link in any browser. You see a card with the title, summary, full markdown content, and action buttons to continue the conversation in any major AI.

**As an AI agent:** Visit the same link. The server detects your user-agent and returns structured YAML via `Content-Type: text/plain` — no HTML, no CSS, just the data:

```yaml
name: Q1 Design Sprint Retro
description: Summary of 3 design sprints — onboarding hit 87% usability, analytics needs iteration.
content: |
  We ran 3 sprints this quarter...

  Key wins: the onboarding redesign tested at 87% usability (up from 62%).
  Key misses: the analytics dashboard overhaul needs another iteration.
```

### API

Create a context programmatically:

```bash
curl -X POST https://contxt.to/api/contexts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "RFC: Adopting TanStack Query",
    "summary": "Technical proposal to migrate from RTK Query.",
    "content": "## Motivation\n\nOur API layer currently uses RTK Query..."
  }'
```

Response:

```json
{
  "slug": "rfc-tanstack-kF3mQ",
  "url": "https://contxt.to/s/rfc-tanstack-kF3mQ"
}
```

See the [full API reference](https://contxt.to/api/ai/page) for detailed documentation, including AI agent integration patterns and rate limits.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | [Turso](https://turso.tech) (libSQL, SQLite-compatible) |
| ORM | [Prisma 7](https://prisma.io) |
| Auth | [NextAuth v5](https://authjs.dev) (Google, GitHub) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI | [shadcn/ui](https://ui.shadcn.com) (base-ui) |
| Fonts | Playfair Display + DM Sans |
| Testing | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |
| Hosting | [Vercel](https://vercel.com) |

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── s/[slug]/     # Shared context pages (browser + AI views)
│   ├── api/          # API routes (contexts, generate-meta, claim, qr, ai)
│   └── page.tsx      # Landing page
├── components/
│   ├── context/      # Context page components (browser + AI)
│   ├── landing/      # Landing page components
│   ├── shared/       # Shared UI (ai-buttons, qr-code)
│   └── ui/           # shadcn/ui components
├── actions/          # Server actions
├── lib/              # Utilities (prisma, auth, schemas, ua, utils)
└── proxy.ts          # AI agent proxy handler (UA-based routing)
```

---

## Contributing

We welcome contributions of all sizes. See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup and workflow
- Branch naming conventions
- Code style guidelines
- PR checklist

Check the [issues tab](https://github.com/redirhub/contxt.to/issues) for open tickets — good first issues are labelled.

---

## Roadmap

- [x] Paste-to-link creation flow
- [x] Dual-render (browser + AI agent) page serving
- [x] AI API proxy with structured YAML output
- [x] Brand and legal pages (Privacy, Terms)
- [ ] User dashboard with link management
- [ ] Link analytics (views, referrers, devices)
- [ ] Link expiration and password protection
- [ ] Public API with API keys
- [ ] MCP server for direct AI tool integration
- [ ] Team / collaboration features

---

## License

MIT © [RedirHub](https://redirhub.com)

---

<p align="center">
  <a href="https://contxt.to">contxt.to</a> ·
  <a href="mailto:hello@contxt.to">hello@contxt.to</a> ·
  <a href="https://github.com/redirhub/contxt.to/discussions">Discussions</a>
</p>
