import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignInForm } from "@/components/auth/signin-form"
import { Logo } from "@/components/shared/logo"

export const metadata = {
  title: "Sign in — contxt.to",
}

export default async function SignInPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 font-sans"
      style={{ background: '#FCF9F2' }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[400px] h-[400px] top-[-150px] right-[-100px] rounded-full"
          style={{ background: 'rgba(255, 42, 109, 0.07)', filter: 'blur(80px)' }} />
        <div className="absolute w-[300px] h-[300px] bottom-[100px] left-[-100px] rounded-full"
          style={{ background: 'rgba(255, 201, 64, 0.10)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo href="/" size="md" />
        </div>

        {/* Card */}
        <div className="rounded-[20px] border shadow-lg overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#F0EDE4', boxShadow: '0 12px 40px rgba(22, 22, 61, 0.08)' }}>
          {/* Accent bar */}
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #FF2A6D, transparent 60%)' }} />

          <div className="p-8">
            <h1 className="text-[22px] font-bold mb-1" style={{ color: '#16163D' }}>Welcome back</h1>
            <p className="text-[13px] mb-6" style={{ color: '#8B8BA8' }}>
              Sign in to manage your context links
            </p>

            <SignInForm />
          </div>
        </div>

        <p className="text-center text-[12px] mt-5" style={{ color: '#C4C0B6' }}>
          No account? Just sign in — we&apos;ll create one automatically.
        </p>
      </div>
    </div>
  )
}
