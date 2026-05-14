import { Button } from '@/components/ui/button'
import { Bot, Sparkles } from 'lucide-react'

interface AiButtonsProps {
  url: string
  title?: string
}

function encodeShareUrl(fullUrl: string): string {
  return encodeURIComponent(fullUrl)
}

const platforms = [
  {
    name: 'ChatGPT',
    label: 'Continue in ChatGPT',
    href: (encodedUrl: string) =>
      `https://chatgpt.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    color: 'bg-[#10a37f] hover:bg-[#0e8c6b] text-white',
    icon: '🤖',
  },
  {
    name: 'Gemini',
    label: 'Continue in Gemini',
    href: (encodedUrl: string) =>
      `https://gemini.google.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    color: 'bg-[#4285f4] hover:bg-[#3367d6] text-white',
    icon: '✨',
  },
  {
    name: 'Claude',
    label: 'Continue in Claude',
    href: (encodedUrl: string) =>
      `https://claude.ai/new?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    color: 'bg-[#d97706] hover:bg-[#b85e00] text-white',
    icon: '🌀',
  },
]

export function AiButtons({ url, title }: AiButtonsProps) {
  const encodedUrl = encodeShareUrl(url)
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={p.href(encodedUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Button
            size="sm"
            className={`text-xs font-medium ${p.color}`}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label}
          </Button>
        </a>
      ))}
    </div>
  )
}
