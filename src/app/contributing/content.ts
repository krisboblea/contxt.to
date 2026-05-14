export const content = `Thanks for your interest in contributing to Contxt — we appreciate it.

This guide covers how to set up the project, submit changes, and what to expect.

---

## Quick Start

\`\`\`bash
git clone https://github.com/redirhub/contxt.to.git
cd contxt.to
npm install
cp .env.local.example .env.local
# Edit .env.local with your Turso database URL and API keys
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

\`\`\`
src/
├── app/              # Next.js App Router pages and API routes
│   ├── s/[slug]/     # Shared context pages (browser + AI views)
│   ├── api/          # API routes (contexts, generate-meta, claim, qr, ai)
│   └── page.tsx      # Landing page
├── components/
│   ├── context/      # Context page components
│   ├── landing/      # Landing page components
│   ├── shared/       # Shared UI (ai-buttons, qr-code)
│   ├── ui/           # shadcn/ui components
│   └── legal/        # Legal page layout
├── actions/          # Server actions (createContext)
├── lib/              # Utilities (prisma, auth, schemas, ua, utils)
└── proxy.ts          # AI agent proxy handler
\`\`\`

**Key technology choices:**

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Database | Turso (libSQL, SQLite-compatible) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Google, GitHub) |
| Styling | Tailwind CSS v4 + inline styles |
| UI Library | shadcn/ui (base-ui) |
| Fonts | Playfair Display (headings), DM Sans (body) |
| Testing | Vitest |
| Hosting | Vercel |

---

## Branch Naming

All branches are created from \`main\`.

| Scenario | Branch name |
|----------|-------------|
| New feature | \`feat/short-description\` |
| Bug fix | \`fix/short-description\` |
| Refactoring | \`refactor/short-description\` |
| Chore / tooling | \`chore/short-description\` |
| Documentation | \`docs/short-description\` |

Example: \`feat/link-expiration\`, \`fix/empty-slug-error\`

---

## Development Workflow

### 1. Pick an issue

Check the Issues tab on GitHub for something to work on. Comment to let everyone know you're taking it. If you're adding a new feature, open an issue first to discuss the approach.

### 2. Create a branch

\`\`\`bash
git checkout main
git pull
git checkout -b feat/your-feature
\`\`\`

### 3. Make changes

- Follow the existing code style (Prettier + ESLint config is in the repo)
- Keep components focused and files reasonably sized
- Use the brand conventions documented in \`brand/guidelines.html\`
- Write tests for new functionality

### 4. Test locally

\`\`\`bash
# Run the full test suite
npm test

# Run specific tests
npx vitest run src/__tests__/api-contexts.test.ts

# Type check
npx tsc --noEmit

# Lint
npm run lint
\`\`\`

### 5. Commit

Use clear, imperative commit messages:

\`\`\`
feat: add link expiration support
fix: handle empty content gracefully
refactor: extract AI summary generation to shared module
\`\`\`

Prefixes: \`feat:\`, \`fix:\`, \`refactor:\`, \`chore:\`, \`docs:\`, \`test:\`, \`style:\`.

### 6. Push and open a PR

\`\`\`bash
git push -u origin feat/your-feature
\`\`\`

Then open a PR against \`main\` on GitHub.

### 7. PR checklist

Before submitting:

- [ ] Tests pass (\`npm test\`)
- [ ] TypeScript compiles (\`npx tsc --noEmit\`)
- [ ] Lint is clean (\`npm run lint\`)
- [ ] New functionality includes tests
- [ ] UI changes follow brand guidelines
- [ ] PR description explains what and why

---

## Code Conventions

### Components

- Use \`'use client'\` only when you need browser APIs or hooks
- Server components by default
- One component per file, named exports
- Props interfaces/types defined inline or in a co-located \`types.ts\`

### Styling

- Use Tailwind utility classes for basic layout
- Use inline \`style={{}}\` objects for brand-specific colors (they're not in the Tailwind config)
- Brand colors reference: see \`brand/guidelines.html\`

### Database

- All Prisma client usage goes through \`getPrismaClient()\` (lazy init for serverless)
- Schema changes go in \`prisma/schema.prisma\`
- After schema changes: \`npx prisma generate\`
- Schema changes need a corresponding migration documented in the PR

---

## Code of Conduct

Be respectful. We're all here to build something useful.

- Focus on the code, not the person
- Assume good intent
- Give constructive feedback
- Ask questions before making assumptions

---

*Questions? Open a Discussion on GitHub or email hello@contxt.to.*`
