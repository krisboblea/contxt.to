// Generate a test user + session for e2e testing
// Run: npx tsx e2e/seed-test-session.ts

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

const url = "file:./prisma/dev.db"
const libsqlConfig = { url }
const libsqlAdapter = new PrismaLibSql(libsqlConfig)
const prisma = new PrismaClient({ adapter: libsqlAdapter } as any)

async function main() {
  // Clean up any previous test user
  await prisma.session.deleteMany({ where: { user: { email: "e2e@contxt.test" } } })
  await prisma.context.deleteMany({ where: { creatorEmail: "e2e@contxt.test" } })
  await prisma.user.deleteMany({ where: { email: "e2e@contxt.test" } })

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: "e2e@contxt.test",
      name: "E2E Test User",
    },
  })
  console.log("✅ User created:", user.id, user.email)

  // Create session (valid for 7 days)
  const sessionToken = "e2e-session-token-" + Date.now().toString(36)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  })
  console.log("✅ Session created:", session.sessionToken)
  console.log("")
  console.log("--- Copy this cookie value ---")
  console.log(session.sessionToken)
  console.log("---")
  console.log("Cookie name: next-auth.session-token")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
