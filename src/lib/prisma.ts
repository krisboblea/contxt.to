// Lazy-loaded PrismaClient that handles serverless environments gracefully
// SQLite doesn't work on Vercel serverless (ephemeral filesystem).
// For production, use Turso (hosted LibSQL) or PlanetScale.

let prismaClient: any = null

export async function getPrismaClient() {
  if (prismaClient) return prismaClient

  try {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')

    const url = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    const adapter = new PrismaLibSql({ url })
    prismaClient = new PrismaClient({ adapter })
    return prismaClient
  } catch {
    // Running in serverless env without DB — return null
    return null
  }
}

// Re-export for backward compat, but won't crash on import
export const prisma = null as any
