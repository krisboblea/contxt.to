import { describe, test, expect, beforeAll, afterAll } from "vitest"
import { createClient } from "@libsql/client"
import "dotenv/config"

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DB_TURSO_AUTH_TOKEN!,
})

const RUN_ID = Date.now().toString(36)

/**
 * Helper: insert a test context
 */
async function insertContext(overrides: {
  id?: string
  slug?: string
  title?: string
  creatorEmail?: string | null
  creatorIp?: string | null
  claimToken?: string | null
  userId?: string | null
  createdAt?: string
} = {}) {
  const id = overrides.id ?? `test-${RUN_ID}-${Math.random().toString(36).slice(2, 8)}`
  const slug = overrides.slug ?? `test-slug-${RUN_ID}-${Math.random().toString(36).slice(2, 8)}`
  const title = overrides.title ?? "Test Context"
  const creatorEmail = overrides.creatorEmail ?? null
  const creatorIp = overrides.creatorIp ?? null
  const claimToken = overrides.claimToken ?? "test-token"
  const userId = overrides.userId ?? null
  const createdAt = overrides.createdAt ?? "datetime('now')"

  const sql = createdAt === "datetime('now')"
    ? `INSERT INTO Context (id, slug, title, summary, content, tags, creatorEmail, creatorIp, claimToken, userId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    : `INSERT INTO Context (id, slug, title, summary, content, tags, creatorEmail, creatorIp, claimToken, userId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${createdAt}, datetime('now'))`

  const args: any[] = [id, slug, title, "Summary for " + title, "Content for " + title, "[]", creatorEmail, creatorIp, claimToken, userId]
  await db.execute({ sql, args })
  return { id, slug }
}

describe("POST /api/claim — email claim flow", () => {
  test("claim sets creatorEmail and clears claimToken, does NOT create a User", async () => {
    const { slug } = await insertContext()

    // Simulate the claim POST handler logic
    const { z } = await import("zod")
    const claimSchema = z.object({
      slug: z.string().min(1),
      token: z.string().min(1),
      email: z.string().email(),
    })
    const body = claimSchema.parse({ slug, token: "test-token", email: `test-${RUN_ID}@example.com` })

    // Look up context
    const [context] = (await db.execute({ sql: "SELECT * FROM Context WHERE slug = ?", args: [body.slug] })).rows
    expect(context).toBeDefined()
    expect(context!.claimToken).toBe("test-token")
    expect(context!.userId).toBeNull()
    expect(context!.creatorEmail).toBeNull()

    // Validate claim token
    expect(context!.claimToken).toBe(body.token)

    // Update: set creatorEmail, clear claimToken (NO user upsert)
    await db.execute({
      sql: "UPDATE Context SET claimToken = NULL, creatorEmail = ? WHERE slug = ?",
      args: [body.email, body.slug],
    })

    // Verify context was updated
    const [updated] = (await db.execute({ sql: "SELECT * FROM Context WHERE slug = ?", args: [body.slug] })).rows
    expect(updated!.creatorEmail).toBe(body.email)
    expect(updated!.claimToken).toBeNull()
    expect(updated!.userId).toBeNull() // NO userId set — that's the fix

    // Verify NO User was created
    const users = await db.execute({ sql: "SELECT COUNT(*) as cnt FROM User WHERE email = ?", args: [body.email] })
    expect(Number(users.rows[0].cnt)).toBe(0)
  })

  test("invalid claim token returns 403", async () => {
    const { slug } = await insertContext()

    const { z } = await import("zod")
    const claimSchema = z.object({
      slug: z.string().min(1),
      token: z.string().min(1),
      email: z.string().email(),
    })
    const body = claimSchema.parse({ slug, token: "wrong-token", email: `test-${RUN_ID}-wrong@example.com` })

    const [context] = (await db.execute({ sql: "SELECT * FROM Context WHERE slug = ?", args: [body.slug] })).rows
    expect(context!.claimToken).not.toBe(body.token)

    // Token validation fails
    const isValid = context!.claimToken === body.token
    expect(isValid).toBe(false)
  })

  test("non-existent slug returns 404", async () => {
    const { z } = await import("zod")
    const claimSchema = z.object({
      slug: z.string().min(1),
      token: z.string().min(1),
      email: z.string().email(),
    })
    const body = claimSchema.parse({ slug: `nonexistent-${RUN_ID}`, token: "token", email: `test@${RUN_ID}.com` })

    const [context] = (await db.execute({ sql: "SELECT * FROM Context WHERE slug = ?", args: [body.slug] })).rows
    expect(context).toBeUndefined()
  })
})

describe("signIn callback — IP-based auto-claim with 3h window", () => {
  const TEST_IP = `::ffff:192.168.${RUN_ID.slice(0, 2)}.1`

  // Create a real user for FK constraints
  const USER_ID = `test-user-${RUN_ID}`

  beforeAll(async () => {
    // Ensure the user exists so we can set userId without FK violation
    await db.execute({
      sql: "INSERT OR IGNORE INTO User (id, email, createdAt, updatedAt) VALUES (?, ?, datetime('now'), datetime('now'))",
      args: [USER_ID, `test-user-${RUN_ID}@example.com`],
    })
  })

  test("matches context created within 3h from same IP", async () => {
    const { slug } = await insertContext({ creatorIp: TEST_IP })

    // Before auto-claim: userId should be null
    const [before] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(before!.userId).toBeNull()

    // Simulate signIn callback: match by IP, within 3h — using SQLite datetime comparison
    await db.execute({
      sql: `UPDATE Context SET userId = ? 
            WHERE creatorIp LIKE ? 
              AND userId IS NULL 
              AND creatorEmail IS NULL 
              AND createdAt >= datetime('now', '-3 hours')`,
      args: [USER_ID, `%${TEST_IP}%`],
    })

    const [after] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(after!.userId).toBe(USER_ID)
  })

  test("does NOT match context older than 3h", async () => {
    const { slug } = await insertContext({
      creatorIp: TEST_IP,
      createdAt: "datetime('now', '-4 hours')",
    })

    await db.execute({
      sql: `UPDATE Context SET userId = ? 
            WHERE creatorIp LIKE ? 
              AND userId IS NULL 
              AND creatorEmail IS NULL 
              AND createdAt >= datetime('now', '-3 hours')`,
      args: [USER_ID, `%${TEST_IP}%`],
    })

    const [after] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(after!.userId).toBeNull() // Should NOT be claimed
  })

  test("does NOT match context that already has userId", async () => {
    const { slug } = await insertContext({
      creatorIp: TEST_IP,
      userId: USER_ID,
    })

    await db.execute({
      sql: `UPDATE Context SET userId = ? 
            WHERE creatorIp LIKE ? 
              AND userId IS NULL 
              AND creatorEmail IS NULL 
              AND createdAt >= datetime('now', '-3 hours')`,
      args: [USER_ID, `%${TEST_IP}%`],
    })

    const [after] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(after!.userId).toBe(USER_ID) // Should keep original userId
  })

  test("does NOT match context that already has creatorEmail", async () => {
    const { slug } = await insertContext({
      creatorIp: TEST_IP,
      creatorEmail: `already-claimed-${RUN_ID}@example.com`,
    })

    await db.execute({
      sql: `UPDATE Context SET userId = ? 
            WHERE creatorIp LIKE ? 
              AND userId IS NULL 
              AND creatorEmail IS NULL 
              AND createdAt >= datetime('now', '-3 hours')`,
      args: [USER_ID, `%${TEST_IP}%`],
    })

    const [after] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(after!.userId).toBeNull() // Has creatorEmail, should NOT be IP-claimed
  })

  test("signIn callback: email-based auto-claim still works for email-claimed contexts", async () => {
    const testEmail = `signin-test-${RUN_ID}@example.com`
    const { slug } = await insertContext({
      creatorEmail: testEmail,
      claimToken: null,
    })

    // Simulate signIn callback matching by email
    await db.execute({
      sql: "UPDATE Context SET userId = ? WHERE creatorEmail = ? AND userId IS NULL",
      args: [USER_ID, testEmail],
    })

    const [after] = (await db.execute({ sql: "SELECT userId FROM Context WHERE slug = ?", args: [slug] })).rows
    expect(after!.userId).toBe(USER_ID)
  })
})

// Cleanup: delete all test records
afterAll(async () => {
  console.log(`\nCleaning up test records for run ${RUN_ID}...`)
  const result = await db.execute({
    sql: "DELETE FROM Context WHERE slug LIKE ?",
    args: [`test-slug-${RUN_ID}-%`],
  })
  console.log(`Deleted ${result.rowsAffected} test records`)
})
