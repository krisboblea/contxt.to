import { Button } from '@/components/ui/button'
import { Bot, Sparkles } from 'lucide-react'

interface AiButtonsProps {
  slug: string
  title?: string
}

const platforms = [
  {
    name: 'ChatGPT',
    label: 'Continue in ChatGPT',
    url: (slug: string) =>
      `https://chatgpt.com/?q=Read+and+discuss+this+contxt+link+https%3A%2F%2Fcontxt.to%2Fs%2F${slug}`,
    color: 'bg-[#10a37f] hover:bg-[#0e8c6b] text-white',
    icon: '🤖',
  },
  {
    name: 'Gemini',
    label: 'Continue in Gemini',
    url: (slug: string) =>
      `https://gemini.google.com/?q=Read+and+discuss+this+contxt+link+https%3A%2F%2Fcontxt.to%2Fs%2F${slug}`,
    color: 'bg-[#4285f4] hover:bg-[#3367d6] text-white',
    icon: '✨',
  },
  {
    name: 'Claude',
    label: 'Continue in Claude',
    url: (slug: string) =>
      `https://claude.ai/new?q=Read+and+discuss+this+contxt+link+https%3A%2F%2Fcontxt.to%2Fs%2F${slug}`,
    color: 'bg-[#d97706] hover:bg-[#b85e00] text-white',
    icon: '🌀',
  },
]

export function AiButtons({ slug, title }: AiButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={p.url(slug)}
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
