import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { classifyUA } from "@/lib/ua"
import type { NextAuthRequest } from "next-auth"

export default auth(function proxy(req: NextAuthRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/dashboard") && !req.auth) {
    const signin = new URL("/auth/signin", req.url)
    signin.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signin)
  }

  const ua = req.headers.get("user-agent") ?? ""
  const visitorType = classifyUA(ua)

  if (visitorType === "ai_agent") {
    const url = req.nextUrl.clone()

    if (pathname === "/") {
      url.pathname = "/api/ai/page"
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith("/s/")) {
      const slug = pathname.replace("/s/", "")
      if (slug) {
        url.pathname = `/api/ai/context/${slug}`
        return NextResponse.rewrite(url)
      }
    }
  }

  const response = NextResponse.next()
  response.headers.set("x-visitor-type", visitorType)
  return response
})

export const config = {
  matcher: ["/", "/s/:slug", "/dashboard/:path*"],
}
