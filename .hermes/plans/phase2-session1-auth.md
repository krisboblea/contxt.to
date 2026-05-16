# Phase 2 — Session 1: NextAuth + Claim Upgrade

## Objective
Wire up real NextAuth v5 with Google OAuth, upgrade claim flow to use real User model.

## Files to Create
| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth v5 config (Google provider, Prisma adapter, callbacks) |
| `src/app/api/auth/[...nextauth]/route.ts` | Route handler: `export { GET, POST }` from auth.ts |

## Files to Modify
| File | Change |
|------|--------|
| `src/lib/auth.ts` | Replace placeholder — re-export from `@/auth` |
| `src/middleware.ts` | Add auth middleware for `/dashboard/*` routes (redirect to `/` if not logged in) |
| `src/app/api/claim/route.ts` | Use `prisma.user.upsert({ where: { email } })` instead of `userId: email` |
| `src/components/landing/email-prompt.tsx` | After claim success, optionally redirect or show "go to dashboard" link |
| `src/app/page.tsx` | If logged in, show "Go to Dashboard" link in navbar |

## Implementation Steps

### Step 1: Install next-auth peer deps
```bash
# next-auth@5.0.0-beta.31 already in package.json
npm install @auth/prisma-adapter
```

### Step 2: Create `src/auth.ts`
NextAuth v5 config:
- Google provider (`@auth/core/providers/google`)
- Prisma adapter (`@auth/prisma-adapter`) with existing prisma client
- Callbacks: `session({ session, token })` — attach user id to session
- Pages: signIn redirect to `/`
- Secret from `AUTH_SECRET` env var

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { getPrismaClient } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(await getPrismaClient()),
  providers: [Google],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
```

### Step 3: Create API route
`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### Step 4: Update `src/lib/auth.ts`
Replace placeholder — re-export from `@/auth`:
```typescript
export { auth, signIn, signOut } from "@/auth"
```

### Step 5: Update `src/middleware.ts`
Use next-auth's middleware for dashboard routes:
```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Existing UA detection logic
  const ua = req.headers.get("user-agent") ?? ""
  // ...rest of UA logic stays
})
```

### Step 6: Upgrade claim route
In `src/app/api/claim/route.ts`:
- Change `userId: email` to `userId: user.id` where user is from `prisma.user.upsert`
- `upsert: { where: { email }, create: { email, name: email.split('@')[0] }, update: {} }`
- Return user info in response so dashboard can use it

### Step 7: Update EmailPrompt
After successful claim:
- Show "Saved! Go to Dashboard" link instead of just dismissing
- If user is already logged in, auto-claim without email prompt

## Verification
- [ ] `npm run build` passes
- [ ] `GET /api/auth/session` returns null when not logged in
- [ ] Google OAuth flow works (login → callback → session)
- [ ] `/dashboard/*` redirects to `/` when not logged in
- [ ] Claim API creates real User record and links context
- [ ] Existing landing page + context page still work
