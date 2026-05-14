'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { Card, CardContent } from '@/components/ui/card'

interface ContextView {
  title: string
  summary: string
  content: string
}

export function BrowserContextPage({ context, url }: { context: ContextView; url: string }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function shareUrl() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: context.title,
          text: context.summary,
          url: url,
        })
        setShared(true)
        setTimeout(() => setShared(false), 1800)
      } catch {
        // User cancelled or error — fallback to copy
        await copyUrl()
      }
    } else {
      await copyUrl()
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const aiLinks = [
    {
      name: 'ChatGPT',
      shortName: 'GPT',
      bg: '#10a37f',
      href: `https://chatgpt.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    },
    {
      name: 'Gemini',
      shortName: 'G',
      bg: '#4285f4',
      href: `https://gemini.google.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    },
    {
      name: 'Claude',
      shortName: 'C',
      bg: '#d97706',
      href: `https://claude.ai/new?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
    },
  ]

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-screen" style={{ background: '#f8f9fc', color: '#1a1a2e' }}>
      <div className="w-full max-w-[560px] flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-10" style={{ fontFamily: "'DM Mono', monospace" }}>
          <div className="w-7 h-7 bg-[#1a1a2e] rounded-md flex items-center justify-center text-white text-[13px] font-bold">c</div>
          <span className="text-base font-semibold tracking-tight text-[#1a1a2e]" style={{ fontFamily: 'Inter, sans-serif' }}>
            contxt<span className="text-[#9595aa]">.to</span>
          </span>
        </div>

        {/* Main card — tighter padding on mobile */}
        <Card className="w-full border border-[#e8e8f0] rounded-[16px] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] transition-shadow duration-300"
          style={{ background: '#ffffff' }}>

          {/* Knowledge info */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e6f7f2] text-[#10a37f] text-[0.72rem] font-semibold uppercase tracking-wider mb-4">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2 2 0 012 2v4h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h4V3a2 2 0 012-2z"/>
              </svg>
              Shared with you
            </div>
            <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight mb-2 text-[#1a1a2e]">
              {context.title}
            </h1>
            <p className="text-sm leading-relaxed text-[#6b6b80]">
              {context.summary}
            </p>
          </div>

          <div className="h-px bg-[#e8e8f0] my-6" />

          {/* Continue section — compact row list on mobile */}
          <div className="text-[0.8rem] font-semibold uppercase tracking-wide text-[#9595aa] mb-3">
            Continue this conversation in
          </div>

          <div className="flex flex-col gap-2">
            {aiLinks.map((ai) => (
              <a
                key={ai.name}
                href={ai.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8f0] text-[#1a1a2e] no-underline transition-all duration-200 hover:border-[#d0d0de] hover:bg-[#fafbfe] hover:-translate-y-px hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] active:translate-y-0 group min-h-[44px]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold transition-transform duration-200 group-hover:scale-105"
                  style={{ background: ai.bg }}
                >
                  {ai.shortName}
                </div>
                <span className="flex-1 text-sm font-semibold">{ai.name}</span>
                <span className="text-xs font-medium text-[#10a37f] opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                  Open →
                </span>
              </a>
            ))}
          </div>

          {/* Copy + Share row — at bottom of card */}
          <div className="flex items-center gap-2 mt-5">
            <div
              className="flex-1 flex items-center gap-2 p-2.5 px-3.5 rounded-[10px] border border-dashed border-[#e8e8f0] cursor-pointer transition-all duration-200 hover:border-[#d0d0de] hover:bg-[#fafbfe]"
              onClick={copyUrl}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9595aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <span className="flex-1 text-xs text-[#9595aa] truncate">
                {url}
              </span>
            </div>
            <button
              onClick={shareUrl}
              className={`px-3 py-2 rounded-md border-none text-[0.72rem] font-semibold cursor-pointer transition-all duration-150 font-inherit min-h-[44px] ${
                shared
                  ? 'bg-[#10a37f] text-white'
                  : 'bg-[#f8f9fc] text-[#6b6b80] hover:bg-[#e8e8f0] hover:text-[#1a1a2e]'
              }`}
            >
              {shared ? 'Shared!' : 'Share'}
            </button>
            <button
              className={`px-3 py-2 rounded-md border-none text-[0.72rem] font-semibold cursor-pointer transition-all duration-150 font-inherit min-h-[44px] ${
                copied
                  ? 'bg-[#10a37f] text-white'
                  : 'bg-[#f8f9fc] text-[#6b6b80] hover:bg-[#e8e8f0] hover:text-[#1a1a2e]'
              }`}
              onClick={(e) => { e.stopPropagation(); copyUrl(); }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </Card>

        {/* Content section */}
        {context.content && (
          <div className="w-full mt-8">
            <CardContent className="prose prose-sm prose-slate max-w-none bg-white rounded-[16px] border border-[#e8e8f0] p-5 sm:p-6 shadow-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSanitize]}>
                {context.content}
              </ReactMarkdown>
            </CardContent>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-xs text-[#9595aa]">
          Powered by <a href="https://contxt.to" className="text-[#6b6b80] no-underline font-medium hover:text-[#10a37f] transition-colors" target="_blank" rel="noopener">contxt.to</a>
        </div>
      </div>
    </main>
  )
}
