import { NextRequest, NextResponse } from "next/server"
import { classifyUA } from "@/lib/ua"

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent")
  const visitorType = classifyUA(ua)

  const response = NextResponse.next()
  response.headers.set("x-visitor-type", visitorType)
  return response
}

export const config = {
  matcher: ["/", "/s/:path*"],
}
