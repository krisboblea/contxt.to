import { NextRequest, NextResponse } from "next/server"
import { classifyUA } from "@/lib/ua"

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? ""
  const visitorType = classifyUA(ua)
  const { pathname } = request.nextUrl

  // AI agents get plain text responses
  if (visitorType === "ai_agent") {
    const url = request.nextUrl.clone()

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

  // Browser visitors: set header for page components
  const response = NextResponse.next()
  response.headers.set("x-visitor-type", visitorType)
  return response
}

export const config = {
  matcher: ["/", "/s/:slug"],
}
