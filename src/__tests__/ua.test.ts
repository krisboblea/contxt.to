import { describe, test, expect } from "vitest"
import { classifyUA } from "@/lib/ua"

describe("classifyUA", () => {
  const aiAgents = [
    "GPTBot/1.0",
    "Mozilla/5.0 (compatible; OAI-SearchBot/1.0)",
    "ChatGPT-User/1.0",
    "Google-Extended",
    "GoogleOther",
    "Gemini/1.0",
    "Claude-Web",
    "Anthropic-AI",
    "Claude/1.0 (anthropic.com)",
    "PerplexityBot/1.0",
    "Microsoft Copilot",
    "Meta-ExternalFetcher/1.1",
    "Bytespider; spider-feedback@bytedance.com",
    "CCBot/2.0",
  ]

  const browsers: Array<string | null | undefined> = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    "",
    null,
    undefined,
  ]

  test.each(aiAgents)("classifies '%s' as ai_agent", (ua) => {
    expect(classifyUA(ua)).toBe("ai_agent")
  })

  test.each(browsers)("classifies '%s' as browser", (ua) => {
    expect(classifyUA(ua)).toBe("browser")
  })
})
