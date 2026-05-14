// Lazy-loaded PrismaClient that handles serverless environments gracefully
// SQLite doesn't work on Vercel serverless (ephemeral filesystem).
// For production, use Turso (hosted LibSQL) or PlanetScale.

let prismaClient: any = null

export async function getPrismaClient() {
  if (prismaClient) return prismaClient

  try {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')

    // Only use environment-level Turso (shared across deploys) for data persistence.
    // DB2_TURSO_* are env-level vars we set manually. Never use DATABASE_URL or DB_TURSO_*
    // (injected by Vercel Turso Integration — unique per deploy, ephemeral).
    const url = process.env.DB2_TURSO_DATABASE_URL || 'file:./prisma/dev.db'
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN

    const config: any = { url }
    if (authToken) config.authToken = authToken

    const adapter = new PrismaLibSql(config)
    prismaClient = new PrismaClient({ adapter })
    return prismaClient
  } catch (e) {
    console.error('[prisma] init failed:', e)
    return null
  }
}
