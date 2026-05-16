import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const FULL_MIGRATION_SQL = `
-- Account table
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- Unique indexes for auth tables
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Add emailVerified + image columns to User (safe to run if already added)
ALTER TABLE "User" ADD COLUMN "emailVerified" DATETIME;
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- Add creatorEmail to Context
ALTER TABLE "Context" ADD COLUMN "creatorEmail" TEXT;
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

    const statements = FULL_MIGRATION_SQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))

    let executed = 0
    let errors: string[] = []

    for (const stmt of statements) {
      try {
        await client.execute(stmt + ";")
        executed++
      } catch (e: any) {
        errors.push(`${stmt.substring(0, 60)}... → ${e.message}`)
      }
    }

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )

    return NextResponse.json({
      success: true,
      executed,
      errors: errors.length > 0 ? errors : undefined,
      tables: tables.rows.map(r => r.name),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
