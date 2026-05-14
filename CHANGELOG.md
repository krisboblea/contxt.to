# Changelog

All notable changes to Contxt will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Brand guidelines page (`brand/guidelines.html`)
- Privacy Policy and Terms of Service pages (`/privacy`, `/terms`)
- Contributing guide (`CONTRIBUTING.md`)

### Planned

- [ ] User dashboard with link management
- [ ] Link analytics (views, referrers, devices)
- [ ] Link expiration and password protection
- [ ] Public API with API keys for programmatic creation
- [ ] Plan enforcement (Free / Pro tiers)
- [ ] Team / collaboration features
- [ ] MCP server for direct AI tool integration

---

## [0.1.0] — 2026-05-14

### Added

#### Core Experience
- Paste-to-link flow: enter content → AI generates title + summary → short link created
- Guest creation — no account needed to share context
- Optional email claim to receive visit notifications
- Slug generation: 2-word prefix + 5-char random code with collision retry
- QR code generation for every shared link
- Copy / Open / QR actions on the result card

#### Landing Page
- Full hero section with tool card (paste, create, preview in one card)
- "How It Works" three-step explainer
- "The Experience" section with dual browser/AI YAML views
- Use Cases section with hover cards
- Scroll-triggered fade-up animations
- Brand: warm beige/pink palette, Playfair Display + DM Sans typography

#### Shared Context Pages (`/s/[slug]`)
- Browser view: rich card layout with title, summary, full markdown content
- AI agent view: structured YAML frontmatter served as `text/plain` via proxy rewrite
- Both views provide "Continue in ChatGPT / Gemini / Claude" action buttons
- Fallback prompt option for AI agents that can't POST to the API
- Smart preview cards for Slack, email, and doc embeds

#### AI Agent Support
- User-agent-based routing (`browser` vs `ai_agent`)
- Treats `curl` and `wget` UAs as AI agents for debugging
- Explicit YAML format: `name`, `description`, `content` fields
- Server-side proxy rewrites AI agent pages to `Content-Type: text/plain`
- Agent landing page (`/api/ai/page`) — structured API reference with examples
- Agent context endpoint (`/api/ai/context/[slug]`) — JSON context data
- Fallback HTML-to-text extraction for agents that can't POST

#### API & Backend
- `POST /api/contexts` — create a context (JSON body)
- `POST /api/generate-meta` — AI-generated title + summary
- `POST /api/claim` — claim a link with email
- `GET /api/qr` — QR code generation
- Server action `createContext` (guest flow, no API needed)
- Input validation via Zod schemas
- Turso (libSQL) database with Prisma ORM
- Lazy `getPrismaClient()` for Vercel serverless compatibility
- Environment: `TURSO_DB_URL`, `TURSO_DB_AUTH_TOKEN`, `TURSO_PRISMA_URL`

### Fixed

- Dynamic origin for "try this prompt" URLs (was hardcoded to `mvp.contxt.to`)
- URL generation uses actual request host (not hardcoded domain)
- Result card uses API-returned URL
- `DB2_TURSO` env fallback for preview database
- Clean AI YAML — removed tags, slug, timestamps; kept only name + description + content
- Markdown content is properly encoded for AI agent pages

### Changed

- Landing page redesigned from concept mockup to production v7 (warm beige/pink)
- Browser context page redesigned matching v2 design spec
- AI agent pages: YAML frontmatter → cleaner format
- Form simplified: one content field, AI handles title + summary generation
- Auth button: removed redundant tagline, cleaner layout

### Removed

- Tags, slug, createdAt, claimToken from AI YAML output
- Dashboard concept mockup section from landing page
- Unused slug/tags/createdAt fields from ContextView browser page

### Security

- Input validation on all API endpoints (Zod)
- IP-based rate limiting structure in place
- Content max length: 50,000 characters

---

## Previous Iterations (pre-0.1.0)

- Dashboard concept mockup iterations (added, reverted, reapplied, refactored)
- Initial Vercel SPA configuration with /api/* exclusion for serverless functions
- AirTable integration exploration (deprecated)

---

[Unreleased]: https://github.com/redirhub/contxt.to/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/redirhub/contxt.to/releases/tag/v0.1.0
