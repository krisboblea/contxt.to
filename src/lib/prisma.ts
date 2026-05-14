// Lazy-loaded PrismaClient that handles serverless environments gracefully
// SQLite doesn't work on Vercel serverless (ephemeral filesystem).
// For production, use Turso (hosted LibSQL) or PlanetScale.

let prismaClient: any = null

export async function getPrismaClient() {
  if (prismaClient) return prismaClient

  try {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')

    // Priority: environment-level Turso (shared across deploys) > deployment-level Turso > local SQLite
    // DB2_TURSO_* are environment-level vars set via Vercel env (persist across deploys)
    // DATABASE_URL / DB_TURSO_* are deployment-level vars set by Turso Integration (unique per deploy — avoid for data persistence)
    const url = process.env.DB2_TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.DB_TURSO_DATABASE_URL || 'file:./prisma/dev.db'
    const authToken = process.env.DB2_TURSO_AUTH_TOKEN || process.env.DB_TURSO_AUTH_TOKEN

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
