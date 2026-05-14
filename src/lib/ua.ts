export type VisitorType = 'browser' | 'ai_agent'

const AI_AGENT_PATTERNS = [
  'curl',
  'Wget',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT',
  'Google-Extended',
  'GoogleOther',
  'Gemini',
  'Claude-Web',
  'Anthropic-AI',
  'Claude',
  'PerplexityBot',
  'Copilot',
  'Meta-ExternalFetcher',
  'Meta-ExternalAgent',
  'Bytespider',
  'CCBot',
]

export function classifyUA(userAgent: string | null | undefined): VisitorType {
  if (!userAgent) return 'browser'

  for (const pattern of AI_AGENT_PATTERNS) {
    if (userAgent.includes(pattern)) {
      return 'ai_agent'
    }
  }

  return 'browser'
}
