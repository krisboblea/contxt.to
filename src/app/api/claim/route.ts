import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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
