import { headers } from "next/headers"
import { LandingBrowser } from "@/components/landing/browser"
import { LandingAI } from "@/components/landing/ai-instructions"

export default async function Home() {
  const h = await headers()
  const visitorType = h.get("x-visitor-type") ?? "browser"

  if (visitorType === "ai_agent") {
    return <LandingAI />
  }

  return <LandingBrowser />
}
