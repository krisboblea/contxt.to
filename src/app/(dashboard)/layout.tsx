import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")

  return (
    <div className="flex h-screen flex-col bg-[#FCF9F2]">
      <DashboardHeader user={session.user} />
      <main className="flex-1 overflow-hidden">
        <NuqsAdapter>{children}</NuqsAdapter>
      </main>
      <Toaster />
    </div>
  )
}
