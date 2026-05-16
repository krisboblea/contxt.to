import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Only available in preview' }, { status: 403 })
  }

  const results: string[] = []
  
  try {
    const { createClient } = require('@libsql/client')
    const url = process.env.DB2_TURSO_DATABASE_URL ?? process.env.DATABASE_URL
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN ?? process.env.DB_TURSO_AUTH_TOKEN
    const libsql = createClient({ url, authToken })
    
    const info = await libsql.execute("PRAGMA table_info(Context)")
    const cols = info.rows.map((r: any) => r.name)
    results.push(`Context columns: ${cols.join(', ')}`)

    if (!cols.includes('creatorEmail')) {
      await libsql.execute("ALTER TABLE Context ADD COLUMN creatorEmail TEXT")
      results.push('✅ creatorEmail column added to Context')
    } else {
      results.push('✅ creatorEmail already exists')
    }

    libsql.close()
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results }, { status: 500 })
  }
}
