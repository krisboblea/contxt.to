import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"
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

const emailProvider = Nodemailer({
  server: process.env.EMAIL_SERVER_URL ?? "smtp://localhost:25",
  from: process.env.EMAIL_FROM ?? "no-reply@contxt.to",
  ...(!process.env.EMAIL_SERVER_URL && {
    sendVerificationRequest({ url }) {
      console.log("\n[Magic Link] Sign-in URL:", url, "\n")
    },
  }),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [emailProvider, Google],
  pages: { signIn: "/auth/signin" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
