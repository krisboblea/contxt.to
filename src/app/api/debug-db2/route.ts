import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const authToken = process.env.DB2_TURSO_AUTH_TOKEN
  const url = process.env.DB2_TURSO_DATABASE_URL

  let dbStatus: any = { connected: false, error: null, tables: null }

  if (url && authToken) {
    try {
      const { createClient } = await import("@libsql/client")
      const client = createClient({ url: url as string, authToken: authToken as string })
      await client.execute("SELECT 1 as test")

      const tables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      dbStatus = { connected: true, tables: tables.rows.map(r => r.name), error: null }
    } catch (e: any) {
      dbStatus = { connected: false, error: e.message, tables: null }
    }
  }

  return NextResponse.json({
    env: {
      VERCEL_ENV: process.env.VERCEL_ENV,
      DB2_TURSO_DATABASE_URL: url ? url.toString().replace(/\/\/.*@/, "//***@") : null,
      DB2_TURSO_AUTH_TOKEN: authToken ? authToken.toString().slice(0, 15) + "..." : null,
      DB_TURSO_DATABASE_URL: process.env.DB_TURSO_DATABASE_URL ? "SET" : null,
      DB_TURSO_AUTH_TOKEN: process.env.DB_TURSO_AUTH_TOKEN ? "SET" : null,
    },
    dbStatus,
  })
}
