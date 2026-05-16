# Phase 2 — Session 2: Dashboard Layout + Sidebar

## Objective
Build the dashboard route group `(dashboard)` with auth-gated sidebar layout matching the mockup.

## Files to Create
| File | Purpose |
|------|---------|
| `src/app/(dashboard)/layout.tsx` | Root layout: sidebar + topbar + content area |
| `src/components/dashboard/sidebar.tsx` | Left sidebar nav: Logo, Contexts, Collections, Analytics |
| `src/components/dashboard/header.tsx` | Top bar: search, user avatar + badge |

## Implementation Details

### Layout Structure (mockup v5)
```
┌──────────────────────────────────────────┐
│  ┌──────────┐  ┌────────────────────────┐│
│  │          │  │  Contexts 6    [+]  👤2 ││
│  │  c Contxt │  │  ┌──────────────────┐  ││
│  │           │  │  │ 🔍 Search...      │  ││
│  │  ►Contexts│  │  ├──────────────────┤  ││
│  │  ☐Collect.│  │  │ [Context Card 1]  │  ││
│  │  ☐Analytics│  │  │ [Context Card 2]  │  ││
│  │           │  │  │ [Context Card 3]  │  ││
│  │           │  │  │ [Context Card 4]  │  ││
│  │           │  │  └──────────────────┘  ││
│  └──────────┘  └────────────────────────┘│
└──────────────────────────────────────────┘
```

### Sidebar (`src/components/dashboard/sidebar.tsx`)
- Fixed left column, ~240px wide
- Logo: "c" icon + "Contxt" in Playfair Display italic
- Nav items:
  - Contexts (active state — pink bg)
  - Collections (disabled for now)
  - Analytics (disabled for now)
- White background, full height
- Bottom section: maybe user info or settings

### Header (`src/components/dashboard/header.tsx`)
- User avatar (circle with initials from `session.user.name`, fallback to email first letter)
- Notification badge (hardcoded "2" for now)
- Dropdown menu: Sign out

### Dashboard Layout (`src/app/(dashboard)/layout.tsx`)
```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({ children }) {
  const session = await auth()
  if (!session) redirect("/")
  
  return (
    <div className="flex min-h-screen bg-[#FCF9F2]">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Route Group Structure
```
src/app/(dashboard)/
├── layout.tsx
├── page.tsx                    ← Context list (Session 3)
├── contexts/
│   ├── new/
│   │   └── page.tsx            ← Create (Session 3)
│   └── [id]/
│       └── edit/
│           └── page.tsx        ← Edit (Session 3)
```

## Design Tokens (matching contxt.to theme)
- Background: `#FCF9F2`
- Sidebar bg: `#FFFFFF`
- Active nav: `rgba(255, 42, 109, 0.06)` bg, `#FF2A6D` text
- Text primary: `#16163D`
- Text secondary: `#4A4A6A`
- Text muted: `#8B8BA8`
- Borders: `#F0EDE4`
- Pink: `#FF2A6D`
- Font family: DM Sans (body), Playfair Display (logo)

## Verification
- [ ] `npm run build` passes
- [ ] `/dashboard` renders sidebar + header when logged in
- [ ] `/dashboard` redirects to `/` when not logged in
- [ ] Sidebar matches mockup layout
- [ ] User avatar shows initial letters
- [ ] Responsive: mobile should collapse sidebar
