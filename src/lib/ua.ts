export type VisitorType = 'browser' | 'ai_agent'

const AI_AGENT_PATTERNS = [
  'curl',
  'wget',
  'gptbot',
  'oai-searchbot',
  'chatgpt',
  'google-extended',
  'googleother',
  'gemini',
  'claude',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'copilot',
  'meta-externalfetcher',
  'meta-externalagent',
  'bytespider',
  'ccbot',
]

export function classifyUA(userAgent: string | null | undefined): VisitorType {
  if (!userAgent) return 'browser'

  const ua = userAgent.toLowerCase()
  for (const pattern of AI_AGENT_PATTERNS) {
    if (ua.includes(pattern)) {
      return 'ai_agent'
    }
  }

  return 'browser'
}
