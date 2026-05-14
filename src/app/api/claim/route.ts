import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per 60 seconds per IP
  const rateLimited = withRateLimit(request, null, { max: 5, windowSeconds: 60 })
  if (rateLimited.status === 429) return rateLimited
  try {
    const body = await request.json()
    const { slug, token, email } = body

    if (!slug || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // In MVP, we just acknowledge the claim request.
    // Full user registration + context claiming will be in Phase 2.
    console.log(`[claim] slug=${slug} email=${email} token=${token ?? 'none'}`)

    return NextResponse.json({ claimed: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
