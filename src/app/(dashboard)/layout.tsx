import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/sonner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")

  return (
    <div className="flex h-screen bg-[#FCF9F2]">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
