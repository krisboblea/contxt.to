import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Context" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "creatorIp" TEXT,
    "claimToken" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Context_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Context_slug_key" ON "Context"("slug");
CREATE INDEX IF NOT EXISTS "Context_slug_idx" ON "Context"("slug");
CREATE INDEX IF NOT EXISTS "Context_claimToken_idx" ON "Context"("claimToken");
CREATE INDEX IF NOT EXISTS "Context_userId_idx" ON "Context"("userId");
`

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() } catch { body = {} }

  if (body.key !== "fix-turso-migrate") {
    return NextResponse.json({ error: "invalid key" }, { status: 403 })
  }

  const url = process.env.DB2_TURSO_DATABASE_URL
  const authToken = process.env.DB2_TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    return NextResponse.json({ error: "DB2 env vars not set" }, { status: 400 })
  }

  try {
    const { createClient } = await import("@libsql/client")
    const client = createClient({ url: url as string, authToken: authToken as string })

    const statements = MIGRATION_SQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))

    let executed = 0
    for (const stmt of statements) {
      await client.execute(stmt + ";")
      executed++
    }

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )

    return NextResponse.json({
      success: true,
      executed,
      tables: tables.rows.map(r => r.name),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
