import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrismaClient } from "@/lib/prisma"
import { withRateLimit } from "@/lib/rate-limit"

const claimSchema = z.object({
  slug: z.string().min(1),
  token: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per 60 seconds per IP
  const rateLimited = withRateLimit(request, null, { max: 5, windowSeconds: 60 })
  if (rateLimited.status === 429) return rateLimited

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = claimSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Missing required fields' },
      { status: 400 },
    )
  }

  const { slug, token, email } = parsed.data

  try {
    const db = await getPrismaClient()
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    // Look up context by slug
    const context = await db.context.findUnique({ where: { slug } })
    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 })
    }

    // Validate claim token
    if (!context.claimToken || token !== context.claimToken) {
      return NextResponse.json({ error: 'Invalid claim token' }, { status: 403 })
    }

    // Check if already claimed
    if (context.userId) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 409 })
    }

    // Upsert user by email, then link context
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email },
    })

    await db.context.update({
      where: { slug },
      data: {
        userId: user.id,
        claimToken: null,
        creatorEmail: email,
      },
    })

    console.log(`[claim] Success: slug=${slug} email=${email}`)
    return NextResponse.json({ claimed: true })
  } catch (e) {
    console.error('[claim] Error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
