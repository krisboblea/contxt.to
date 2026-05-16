import { NextResponse } from 'next/server'

// One-time migration endpoint - DO NOT KEEP IN PRODUCTION
export async function GET() {
  // Only allow in preview environments
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Only available in preview' }, { status: 403 })
  }

  const results: string[] = []
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client')

    const url = process.env.DB2_TURSO_DATABASE_URL ?? process.env.DATABASE_URL
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN ?? process.env.DB_TURSO_AUTH_TOKEN
    
    const libsql = createClient({ url, authToken })
    
    // Check User table
    const userInfo = await libsql.execute("PRAGMA table_info(User)")
    const userCols = userInfo.rows.map((r: any) => r.name)
    results.push(`User columns: ${userCols.join(', ')}`)

    if (!userCols.includes('emailVerified')) {
      await libsql.execute("ALTER TABLE User ADD COLUMN emailVerified DATETIME")
      results.push('✅ emailVerified column added to User')
    } else {
      results.push('✅ emailVerified already exists')
    }

    // Create Account table
    const accountExists = await libsql.execute("SELECT name FROM sqlite_master WHERE name='Account' AND type='table'")
    if (accountExists.rows.length === 0) {
      await libsql.execute(`CREATE TABLE "Account" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"type" TEXT NOT NULL,"provider" TEXT NOT NULL,"providerAccountId" TEXT NOT NULL,"refresh_token" TEXT,"access_token" TEXT,"expires_at" INTEGER,"token_type" TEXT,"scope" TEXT,"id_token" TEXT,"session_state" TEXT,CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`)
      await libsql.execute('CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")')
      results.push('✅ Account table created')
    } else {
      results.push('✅ Account already exists')
    }

    // Create Session table
    const sessionExists = await libsql.execute("SELECT name FROM sqlite_master WHERE name='Session' AND type='table'")
    if (sessionExists.rows.length === 0) {
      await libsql.execute(`CREATE TABLE "Session" ("id" TEXT NOT NULL PRIMARY KEY,"sessionToken" TEXT NOT NULL,"userId" TEXT NOT NULL,"expires" DATETIME NOT NULL,CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`)
      await libsql.execute('CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken")')
      results.push('✅ Session table created')
    } else {
      results.push('✅ Session already exists')
    }

    // Create VerificationToken table
    const vtExists = await libsql.execute("SELECT name FROM sqlite_master WHERE name='VerificationToken' AND type='table'")
    if (vtExists.rows.length === 0) {
      await libsql.execute(`CREATE TABLE "VerificationToken" ("identifier" TEXT NOT NULL,"token" TEXT NOT NULL,"expires" DATETIME NOT NULL)`)
      await libsql.execute('CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token")')
      await libsql.execute('CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")')
      results.push('✅ VerificationToken table created')
    } else {
      results.push('✅ VerificationToken already exists')
    }

    libsql.close()
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack, results }, { status: 500 })
  }
}
