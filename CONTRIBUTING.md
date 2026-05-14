# Contributing to Contxt

Thanks for your interest in contributing to Contxt — we appreciate it.

This guide covers how to set up the project, submit changes, and what to expect.

---

## Quick Start

```bash
# Clone
git clone https://github.com/redirhub/contxt.to.git
cd contxt.to

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Turso database URL and API keys

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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
│   ├── ui/           # shadcn/ui components
│   └── legal/        # Legal page layout
├── actions/          # Server actions (createContext)
├── lib/              # Utilities (prisma, auth, schemas, ua, utils)
└── proxy.ts          # AI agent proxy handler
```

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

All branches are created from `main`.

| Scenario | Branch name |
|----------|-------------|
| New feature | `feat/short-description` |
| Bug fix | `fix/short-description` |
| Refactoring | `refactor/short-description` |
| Chore / tooling | `chore/short-description` |
| Documentation | `docs/short-description` |

Example: `feat/link-expiration`, `fix/empty-slug-error`

---

## Development Workflow

### 1. Pick an issue

Check the [Issues tab](https://github.com/redirhub/contxt.to/issues) for something to work on. Comment to let everyone know you're taking it.

If you're adding a new feature, open an issue first to discuss the approach.

### 2. Create a branch

```bash
git checkout main
git pull
git checkout -b feat/your-feature
```

### 3. Make changes

- Follow the existing code style (Prettier + ESLint config is in the repo)
- Keep components focused and files reasonably sized
- Use the brand conventions documented in `brand/guidelines.html`
- Write tests for new functionality

### 4. Test locally

```bash
# Run the full test suite
npm test

# Run specific tests
npx vitest run src/__tests__/api-contexts.test.ts

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### 5. Commit

Use clear, imperative commit messages:

```
feat: add link expiration support
fix: handle empty content gracefully
refactor: extract AI summary generation to shared module
```

Prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `style:`.

### 6. Push and open a PR

```bash
git push -u origin feat/your-feature
```

Then open a PR against `main` on GitHub.

### 7. PR checklist

Before submitting:

- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Lint is clean (`npm run lint`)
- [ ] New functionality includes tests
- [ ] UI changes follow brand guidelines
- [ ] PR description explains what and why

---

## Code Conventions

### Components

- Use `'use client'` only when you need browser APIs or hooks
- Server components by default
- One component per file, named exports
- Props interfaces/types defined inline or in a co-located `types.ts`

### Styling

- Use Tailwind utility classes for basic layout
- Use inline `style={{}}` objects for brand-specific colors (they're not in the Tailwind config)
- Brand colors reference: see `brand/guidelines.html`

### Database

- All Prisma client usage goes through `getPrismaClient()` (lazy init for serverless)
- Schema changes go in `prisma/schema.prisma`
- After schema changes: `npx prisma generate`
- Schema changes need a corresponding migration documented in the PR

---

## Reporting Issues

Use the [GitHub Issues](https://github.com/redirhub/contxt.to/issues) page.

**Bug reports** should include:

- Steps to reproduce
- Expected behavior vs actual behavior
- Browser/device info
- Screenshots if applicable

**Feature requests** should describe the problem you're solving, not just the solution you want.

---

## Code of Conduct

Be respectful. We're all here to build something useful.

- Focus on the code, not the person
- Assume good intent
- Give constructive feedback
- Ask questions before making assumptions

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

*Questions? Open a [Discussion](https://github.com/redirhub/contxt.to/discussions) or email hello@contxt.to.*
