# Phase 2 — Session 3: Dashboard Pages (List, Detail, Edit, Delete, New)

## Objective
Build the context list with split-pane detail view, edit/delete/new pages for the dashboard.

## Files to Create
| File | Purpose |
|------|---------|
| `src/app/(dashboard)/page.tsx` | Main dashboard: context list + detail panel (server component) |
| `src/components/dashboard/context-list.tsx` | Left pane — searchable context card list (client component) |
| `src/components/dashboard/context-detail.tsx` | Right pane — context detail with stats + actions (client component) |
| `src/actions/dashboard-context.ts` | Server actions: list user contexts, delete, update |
| `src/app/(dashboard)/contexts/[id]/edit/page.tsx` | Edit page with prefilled form |
| `src/app/(dashboard)/contexts/new/page.tsx` | Create new context from dashboard |

## Data

### Server action: `src/actions/dashboard-context.ts`

```typescript
"use server"
import { auth } from "@/auth"
import { getPrismaClient } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// List user's contexts, newest first
export async function getUserContexts() {
  const session = await auth()
  if (!session?.user?.id) return []
  
  const db = await getPrismaClient()
  return db.context.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, summary: true,
      tags: true, createdAt: true, // views would go here when tracked
    },
  })
}

// Get single context (only if owned by user)
export async function getUserContext(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null
  
  const db = await getPrismaClient()
  return db.context.findFirst({
    where: { id, userId: session.user.id },
  })
}

// Update context
export async function updateContext(id: string, data: { title: string; summary: string; content: string; tags?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const db = await getPrismaClient()
  const ctx = await db.context.findFirst({ where: { id, userId: session.user.id } })
  if (!ctx) throw new Error("Not found")
  
  await db.context.update({
    where: { id },
    data: {
      title: data.title,
      summary: data.summary,
      content: data.content,
      tags: JSON.stringify(parseTags(data.tags)),
    },
  })
  
  revalidatePath(`/s/${ctx.slug}`)
  revalidatePath("/dashboard")
}

// Delete context
export async function deleteContext(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const db = await getPrismaClient()
  const ctx = await db.context.findFirst({ where: { id, userId: session.user.id } })
  if (!ctx) throw new Error("Not found")
  
  await db.context.delete({ where: { id } })
  revalidatePath("/dashboard")
}
```

### Dashboard Page (`src/app/(dashboard)/page.tsx`)
Server component:
1. `await auth()` — redirect if no session
2. `await getUserContexts()` — fetch contexts
3. Pass to client components

### Context List (`src/components/dashboard/context-list.tsx`)
Client component:
- Search input filtering contexts by title/summary
- List of cards, each showing:
  - Title (bold)
  - Excerpt (summary, truncated to 2 lines)
  - Time ago (relative)
  - View count (placeholder: 0 for now — analytics comes later)
- Clicking a card selects it (updates URL search param `?id=xxx` or `?slug=xxx`)
- States: loading, empty ("No contexts yet. Create your first one →")

### Context Detail (`src/components/dashboard/context-detail.tsx`)
Client component (reads URL search param):
- When no context selected: muted prompt "Select a context to preview"
- When context selected, right panel shows:
  - Title (h2)
  - Context link (`contxt.to/s/{slug}`)
  - Copy link button
  - Edit button → navigates to `/dashboard/contexts/[id]/edit`
  - Delete button → confirmation dialog → delete action
  - Stats section:
    - VIEWS: `0` (placeholder)
    - CREATED: relative time + full date
    - AI CONTINUATIONS: `0` (placeholder)
  - Full markdown content rendered with react-markdown

### Edit Page (`src/app/(dashboard)/contexts/[id]/edit/page.tsx`)
1. Server component: fetch context by id, verify ownership
2. Pre-fill form with existing values (title, summary, content, tags)
3. Save button → `updateContext` server action → revalidate
4. Cancel button → back to dashboard
5. Reuse the create form schema from `src/lib/schemas.ts`

### New Page (`src/app/(dashboard)/contexts/new/page.tsx`)
Alternative entry point for creating contexts (same `create-form` as landing but without email prompt)

## Verification
- [ ] `npm run build` passes
- [ ] Dashboard lists only current user's contexts
- [ ] Empty state shows when no contexts
- [ ] Search filters context list in real-time
- [ ] Clicking context shows detail in right panel
- [ ] Edit page prefills and saves
- [ ] Delete removes context and redirects to list
- [ ] New creates context and navigates to detail
- [ ] All server actions enforce ownership (can't edit another user's context)
