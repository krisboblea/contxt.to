import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DB_TURSO_AUTH_TOKEN;

console.log("Connecting to Turso at:", url);
const turso = createClient({ url, authToken });

// Drop wrong tables first
await turso.execute("DROP TABLE IF EXISTS contexts");
await turso.execute("DROP TABLE IF EXISTS users");
console.log("Dropped old tables");

// Create User table
await turso.execute(`CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
)`);
console.log("Created User table");

await turso.execute(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`);

// Create Context table
await turso.execute(`CREATE TABLE IF NOT EXISTS "Context" (
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
)`);
console.log("Created Context table");

await turso.execute(`CREATE UNIQUE INDEX "Context_slug_key" ON "Context"("slug")`);
await turso.execute(`CREATE INDEX "Context_slug_idx" ON "Context"("slug")`);
await turso.execute(`CREATE INDEX "Context_claimToken_idx" ON "Context"("claimToken")`);
await turso.execute(`CREATE INDEX "Context_userId_idx" ON "Context"("userId")`);
console.log("Created indexes");

// Verify
const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'");
console.log("Tables:", tables.rows.map(r => r.name).join(", "));
const idxs = await turso.execute("SELECT name FROM sqlite_master WHERE type='index'");
console.log("Indexes:", idxs.rows.map(r => r.name).join(", "));

// Test with Prisma-compatible naming
const ctx = await turso.execute("SELECT COUNT(*) as c FROM \"Context\"");
console.log("Context count:", ctx.rows[0].c);
console.log("Schema pushed successfully!");
