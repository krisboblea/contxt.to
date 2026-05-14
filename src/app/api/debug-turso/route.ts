import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Check env vars
  results.env = {
    DB2_TURSO_DATABASE_URL: !!process.env.DB2_TURSO_DATABASE_URL,
    DB2_TURSO_AUTH_TOKEN: !!process.env.DB2_TURSO_AUTH_TOKEN,
    DB_TURSO_DATABASE_URL: !!process.env.DB_TURSO_DATABASE_URL,
    DB_TURSO_AUTH_TOKEN: !!process.env.DB_TURSO_AUTH_TOKEN,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }

  // 2. Test direct @libsql/client connection
  try {
    const { createClient } = await import("@libsql/client")
    const url = process.env.DB2_TURSO_DATABASE_URL || process.env.DB_TURSO_DATABASE_URL
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN || process.env.DB_TURSO_AUTH_TOKEN

    if (url && authToken) {
      const client = createClient({ url, authToken })
      const r = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
      results.libsql_direct = { ok: true, tables: r.rows.map((r: any) => r.name) }
    } else {
      results.libsql_direct = { ok: false, error: "Missing env vars" }
    }
  } catch (e: any) {
    results.libsql_direct = { ok: false, error: e.message }
  }

  // 3. Test Prisma + adapter
  try {
    const { PrismaClient } = await import("@prisma/client")
    const { PrismaLibSql } = await import("@prisma/adapter-libsql")

    const url = process.env.DB2_TURSO_DATABASE_URL || process.env.DB_TURSO_DATABASE_URL
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN || process.env.DB_TURSO_AUTH_TOKEN

    if (url && authToken) {
      const adapter = new PrismaLibSql({ url, authToken })
      const prisma = new PrismaClient({ adapter })
      const count = await prisma.context.count()
      results.prisma = { ok: true, context_count: count }
    } else {
      results.prisma = { ok: false, error: "Missing env vars" }
    }
  } catch (e: any) {
    results.prisma = { ok: false, error: e.message, stack: e.stack?.split("\n").slice(0, 5).join("\n") }
  }

  return NextResponse.json(results)
}
