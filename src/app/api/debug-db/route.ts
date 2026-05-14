import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const url = process.env.DATABASE_URL || process.env.DB2_TURSO_DATABASE_URL || "file:./prisma/dev.db"
  const authToken = process.env.DB2_TURSO_AUTH_TOKEN

  // Sanitize URLs — show protocol + host only
  function sanitizeUrl(u: string): string {
    try {
      const p = u.startsWith("libsql://") ? `libsql://${u.slice(9)}` : u
      const parsed = new URL(p)
      return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`
    } catch {
      return u.length > 60 ? u.slice(0, 40) + "..." : u
    }
  }

  const env = {
    DATABASE_URL: process.env.DATABASE_URL ? `${sanitizeUrl(process.env.DATABASE_URL)}` : null,
    DB2_TURSO_DATABASE_URL: process.env.DB2_TURSO_DATABASE_URL ? `${sanitizeUrl(process.env.DB2_TURSO_DATABASE_URL)}` : null,
    DB_TURSO_AUTH_TOKEN: authToken ? `${authToken.slice(0, 10)}...` : null,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }

  // Determine database type
  const isTurso = url.startsWith("libsql://")
  const isLocal = url.startsWith("file:")

  // Test database connection
  let dbStatus: any = { connected: false, error: null, tableCount: null, sampleSlugs: null }

  try {
    const db = await getPrismaClient()
    if (!db) {
      dbStatus.error = "getPrismaClient returned null"
    } else {
      // Try a simple query
      try {
        const result = await (db.context?.count ? db.context.count() : db.$queryRawUnsafe ? db.$queryRawUnsafe("SELECT COUNT(*) as cnt FROM Context") : Promise.resolve(null))

        if (typeof result === "number") {
          dbStatus.tableCount = result
          dbStatus.connected = true
        } else if (result && Array.isArray(result)) {
          dbStatus.tableCount = result[0]?.cnt
          dbStatus.connected = true
        } else {
          dbStatus.tableCount = result
          dbStatus.connected = true
        }
      } catch (queryErr: any) {
        dbStatus.error = queryErr.message
      }

      // Test with 1+1
      if (!dbStatus.error) {
        try {
          await db.$queryRawUnsafe("SELECT 1 as one")
        } catch {
          // ignored, connection already verified
        }
      }
    }
  } catch (initErr: any) {
    dbStatus.error = `init failed: ${initErr.message}`
  }

  return NextResponse.json({
    dbType: isTurso ? "turso" : isLocal ? "local-sqlite" : "unknown",
    url: sanitizeUrl(url),
    env,
    dbStatus,
    timestamp: new Date().toISOString(),
  })
}
