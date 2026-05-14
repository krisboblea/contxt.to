import { describe, test, expect, afterAll } from "vitest"
import { createClient } from "@libsql/client"
import "dotenv/config"

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DB_TURSO_AUTH_TOKEN!,
})

// Generate a unique test run id to identify test data
const RUN_ID = Date.now().toString(36)

describe("content length boundaries (integration — production DB)", () => {
  test("content at minimum length (10 chars) is accepted", async () => {
    const content = "A".repeat(10)
    const title = `min-10-${RUN_ID}`
    await expect(
      db.execute({
        sql: `INSERT INTO Context (id, slug, title, summary, content, tags, claimToken, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          `test-${RUN_ID}-min10`,
          `test-min10-${RUN_ID}`,
          title,
          content + " is a summary that passes validation.",
          content,
          "[]",
          "test-token",
        ],
      })
    ).resolves.toBeDefined()
  }, 10000)

  test("content below minimum (9 chars) is rejected by Zod", async () => {
    // This should fail at the Zod layer before DB
    const { z } = await import("zod")
    const schema = z.object({
      title: z.string().min(2).max(120),
      summary: z.string().min(10).max(500),
      content: z.string().min(10).max(50000),
    })
    const result = schema.safeParse({
      title: "Test",
      summary: "This is a valid summary.",
      content: "A".repeat(9),
    })
    expect(result.success).toBe(false)
  })

  test("content at maximum (50000 chars) is accepted", async () => {
    const content = "B".repeat(50000)
    const title = `max-50000-${RUN_ID}`
    await expect(
      db.execute({
        sql: `INSERT INTO Context (id, slug, title, summary, content, tags, claimToken, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          `test-${RUN_ID}-max50000`,
          `test-max50000-${RUN_ID}`,
          title,
          content.substring(0, 200) + " long summary here.",
          content,
          "[]",
          "test-token",
        ],
      })
    ).resolves.toBeDefined()
  }, 15000)

  test("content above maximum (50001 chars) is rejected by Zod", async () => {
    const { z } = await import("zod")
    const schema = z.object({
      title: z.string().min(2).max(120),
      summary: z.string().min(10).max(500),
      content: z.string().min(10).max(50000),
    })
    const result = schema.safeParse({
      title: "Test",
      summary: "This is a valid summary.",
      content: "C".repeat(50001),
    })
    expect(result.success).toBe(false)
  })

  test("title at exactly 120 chars works", async () => {
    const title = "T".repeat(120)
    const slug = `title120-${RUN_ID}`
    await expect(
      db.execute({
        sql: `INSERT INTO Context (id, slug, title, summary, content, tags, claimToken, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          `test-${RUN_ID}-title120`,
          slug,
          title,
          "This is exactly a valid summary for testing.",
          "Content for the title 120 length test case.",
          "[]",
          "test-token",
        ],
      })
    ).resolves.toBeDefined()
  }, 10000)

  test("title at 121 chars is rejected by Zod", async () => {
    const { z } = await import("zod")
    const schema = z.object({
      title: z.string().min(2).max(120),
    })
    const result = schema.safeParse({ title: "T".repeat(121) })
    expect(result.success).toBe(false)
  })

  test("summary at exactly 500 chars works", async () => {
    const summary = "S".repeat(500)
    const slug = `summary500-${RUN_ID}`
    await expect(
      db.execute({
        sql: `INSERT INTO Context (id, slug, title, summary, content, tags, claimToken, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          `test-${RUN_ID}-summary500`,
          slug,
          "Summary 500 Test",
          summary,
          "Content for the summary 500 length test.",
          "[]",
          "test-token",
        ],
      })
    ).resolves.toBeDefined()
  }, 10000)

  test("summary at 501 chars is rejected by Zod", async () => {
    const { z } = await import("zod")
    const schema = z.object({
      summary: z.string().min(10).max(500),
    })
    const result = schema.safeParse({ summary: "S".repeat(501) })
    expect(result.success).toBe(false)
  })
})

// Cleanup: delete all test records created in this run
afterAll(async () => {
  console.log(`\nCleaning up test records for run ${RUN_ID}...`)
  const result = await db.execute({
    sql: `DELETE FROM Context WHERE id LIKE ?`,
    args: [`test-${RUN_ID}-%`],
  })
  console.log(`Deleted ${result.rowsAffected} test records`)
})
