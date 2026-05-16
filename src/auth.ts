import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"]
  }
}

const url = process.env.DB2_TURSO_DATABASE_URL ?? "file:./prisma/dev.db"
const authToken = process.env.DB2_TURSO_AUTH_TOKEN
const libsqlConfig = authToken ? { url, authToken } : { url }

const libsqlAdapter = new PrismaLibSql(libsqlConfig)
const prisma = new PrismaClient({ adapter: libsqlAdapter } as any)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  pages: { signIn: "/" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
