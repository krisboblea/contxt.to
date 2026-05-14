'use client'

import { useState, useEffect, useRef } from 'react'

export function LandingBrowser() {
  return (
    <main>
      <LandingContent />
    </main>
  )
}

function LandingContent() {
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    slug: string
    claimToken: string
    url: string
    title: string
    summary: string
    body: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setBaseUrl(window.location.origin) }, [])

  // Scroll observer for animations
  useEffect(() => {
    if (!mounted) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.anim-up').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [mounted, result])

  // Mobile scroll: when result changes, scroll to tool card
  useEffect(() => {
    if (result && window.innerWidth < 1024) {
      areaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const charCount = content.length

  async function handleCreate() {
    const text = content.trim()
    if (!text) {
      textareaRef.current?.focus()
      return
    }
    if (text.length < 10) {
      setError('Content must be at least 10 characters')
      return
    }

    setPending(true)
    setGenerating(true)
    setError(null)

    try {
      // Step 1: Generate metadata
      const metaRes = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })

      if (!metaRes.ok) throw new Error('Failed to generate metadata')

      const meta = await metaRes.json()
      setGenerating(false)

      // Step 2: Create context
      const ctxRes = await fetch('/api/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meta.title,
          summary: meta.summary,
          content: text,
          tags: [],
        }),
      })

      if (!ctxRes.ok) {
        const err = await ctxRes.json()
        throw new Error(err.error || 'Failed to create')
      }

      const ctx = await ctxRes.json()
      setContent('')
      setResult({
        slug: ctx.slug,
        claimToken: ctx.claimToken || '',
        url: ctx.url,
        title: meta.title,
        summary: meta.summary,
        body: text.length > 200 ? text.substring(0, 197) + '...' : text,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
      setGenerating(false)
    }
  }

  async function copyLink() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = result.url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValue || !result) return
    setClaimError(null)
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: result.slug, token: result.claimToken, email: emailValue }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEmailSent(true)
    } catch {
      setClaimError('Could not save right now')
    }
  }

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#FCF9F2' }}>
        <div className="absolute w-[500px] h-[500px] top-[-200px] right-[-100px] rounded-full opacity-30"
          style={{ background: 'rgba(255, 42, 109, 0.08)', filter: 'blur(80px)' }} />
        <div className="absolute w-[400px] h-[400px] bottom-[200px] left-[-150px] rounded-full opacity-30"
          style={{ background: 'rgba(255, 201, 64, 0.12)', filter: 'blur(80px)' }} />
        <div className="absolute w-[300px] h-[300px] bottom-[-100px] right-[20%] rounded-full opacity-30"
          style={{ background: 'rgba(255, 42, 109, 0.05)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b"
        style={{
          background: 'rgba(252, 249, 242, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: '#F0EDE4',
        }}>
        <a href="/" className="flex items-center gap-2.5 no-underline" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 24, fontWeight: 700, color: '#16163D', letterSpacing: '-0.02em' }}>
          <span className="w-[30px] h-[30px] flex items-center justify-center text-white text-[14px] font-extrabold not-italic"
            style={{ background: '#FF2A6D', borderRadius: 8 }}>
            c
          </span>
          Contxt
        </a>
        <div className="flex items-center gap-8 max-sm:hidden">
          <a href="#how" className="text-sm font-medium no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }) }}>
            How It Works
          </a>
          <a href="#use" className="text-sm font-medium no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onClick={(e) => { e.preventDefault(); document.getElementById('use')?.scrollIntoView({ behavior: 'smooth' }) }}>
            Use Cases
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex flex-col px-6 pt-[110px] pb-10"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div className="w-full max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_480px] gap-12 items-center"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

          {/* Left: Headline */}
          <div className="anim-up" style={{ '--delay': '0.15s' } as React.CSSProperties}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-6 border"
              style={{ color: '#FF2A6D', borderColor: '#E8E3D8', background: 'rgba(255, 42, 109, 0.03)', letterSpacing: '0.06em' }}>
              <span className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ background: '#FF2A6D' }} />
              CONTEXT SHARING FOR AI
            </div>

            <h1 className="font-heading font-bold leading-[1.08] tracking-[-0.03em] mb-[18px]"
              style={{ fontSize: 'clamp(42px, 4.8vw, 66px)', color: '#16163D' }}>
              Your context,<br />
              in <em className="italic not-italic" style={{ color: '#FF2A6D', fontStyle: 'italic' }}>a single link</em>.
            </h1>

            <p className="text-base leading-relaxed mb-8" style={{
              fontSize: 'clamp(15px, 1.1vw, 18px)',
              color: '#4A4A6A',
              maxWidth: 420,
              lineHeight: 1.7,
            }}>
              Paste any knowledge. Get a short link. Anyone can read the gist and
              continue in ChatGPT, Gemini, or Claude — instantly, no signup.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                  ⚡
                </span>
                Zero friction — paste and share
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                  🤖
                </span>
                Continue in any AI
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                  🔒
                </span>
                Private by default
              </div>
            </div>
          </div>

          {/* Right: Tool Card */}
          <div ref={areaRef} className="anim-up" style={{ '--delay': '0.3s' } as React.CSSProperties}>
            <div className="rounded-[24px] border shadow-lg overflow-hidden relative"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 24px 60px rgba(22, 22, 61, 0.12)',
              }}>
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: 'linear-gradient(90deg, #FF2A6D, transparent 60%)' }} />

              <div className="p-6 sm:p-7" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

                {/* Result Area */}
                <div className="transition-all duration-500"
                  style={{ animation: result ? 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards' : undefined }}>

                  {/* Link row */}
                  {result && (
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-[14px] mb-3 border"
                      style={{
                        background: 'rgba(255, 42, 109, 0.06)',
                        borderColor: 'rgba(255, 42, 109, 0.1)',
                      }}>
                      <span className="flex-1 text-[14px] font-semibold min-w-0 truncate" style={{ color: '#FF2A6D' }}>
                        {result.url}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Open */}
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold no-underline cursor-pointer transition-all font-inherit"
                          style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          Open
                        </a>
                        {/* QR toggle */}
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all font-inherit"
                          style={{
                            background: showQR ? 'rgba(255,42,109,0.08)' : '#FFFFFF',
                            borderColor: showQR ? '#FF2A6D' : '#E8E3D8',
                            color: showQR ? '#FF2A6D' : '#4A4A6A',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="4" height="4" rx="1" />
                            <line x1="9" y1="14" x2="14" y2="9" />
                            <line x1="9" y1="16" x2="16" y2="9" />
                          </svg>
                          QR
                        </button>
                        {/* Copy */}
                        <button
                          onClick={copyLink}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all font-inherit ${
                            copied ? 'text-white' : ''
                          }`}
                          style={
                            copied
                              ? { background: '#FF2A6D', borderColor: '#FF2A6D' }
                              : { background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }
                          }
                          onMouseEnter={(e) => {
                            if (!copied) { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D' }
                          }}
                          onMouseLeave={(e) => {
                            if (!copied) { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A' }
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* QR Code (collapsible) */}
                  {result && showQR && (
                    <div className="flex justify-center mb-3.5 p-3 rounded-[14px] border"
                      style={{ background: '#FFFFFF', borderColor: '#F0EDE4' }}>
                      <img
                        src={`/api/qr?url=${encodeURIComponent(result.url)}`}
                        alt="QR Code for link"
                        width={120}
                        height={120}
                        className="block"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  )}

                  {/* Preview block */}
                  <div className="p-5 rounded-[14px] border" style={{ background: '#FCF9F2', borderColor: '#F0EDE4' }}>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D', letterSpacing: '0.06em' }}>
                      {result ? '✨ Your Link Preview' : '💡 Try This Prompt'}
                    </span>

                    <div className="text-[17px] font-bold leading-tight mb-1.5" style={{ color: '#16163D' }}>
                      {result ? result.title : 'Share AI Chat → One Link'}
                    </div>

                    <div className="text-[13px] leading-relaxed mb-4" style={{ color: '#8B8BA8' }}>
                      {result ? (
                        result.summary
                      ) : (
                        <>
                          Paste into ChatGPT / Gemini and tap Continue:
                          <code className="block text-[13px] leading-relaxed font-medium p-2.5 mt-2 rounded-[8px] border"
                            style={{
                              background: 'rgba(255, 42, 109, 0.06)',
                              color: '#FF2A6D',
                              borderColor: 'rgba(255, 42, 109, 0.1)',
                            }}>
                            {`read ${baseUrl} and shorten this chat and create a shareable link`}
                          </code>
                        </>
                      )}
                    </div>

                    {!result && (
                      <div className="flex gap-2">
                        <a href={`https://chatgpt.com/?q=${encodeURIComponent('read ' + baseUrl + ' and shorten this chat and create a shareable link')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[13px] font-semibold border no-underline cursor-pointer transition-all font-inherit"
                          style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D'; e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.background = '#FFFFFF' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.281 2.719a3 3 0 0 0-3.04-.602L3.166 8.356a3 3 0 0 0-.16 5.528l6.047 3.14 3.142 6.046a3 3 0 0 0 5.528-.16l6.24-18.074a3 3 0 0 0-.602-3.04z" />
                          </svg>
                          Continue in ChatGPT
                        </a>
                        <a href={`https://gemini.google.com/?q=${encodeURIComponent('read ' + baseUrl + ' and shorten this chat and create a shareable link')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[13px] font-semibold border no-underline cursor-pointer transition-all font-inherit"
                          style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D'; e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.background = '#FFFFFF' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          Continue in Gemini
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Inline email section */}
                  {result && !emailSent && (
                    <form onSubmit={handleClaim} className="mt-4 p-4 rounded-[14px] border"
                      style={{ background: '#FFFFFF', borderColor: '#F0EDE4' }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: '#4A4A6A' }}>
                          ✉️ Want to track your link?
                        </span>
                        <div className="flex items-center gap-1.5 flex-1 max-w-[280px]">
                          <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => { setEmailValue(e.target.value); setClaimError(null) }}
                            placeholder="your@email.com"
                            required
                            className="flex-1 px-3 py-1.5 rounded-[10px] border text-[12px] outline-none transition-all font-inherit"
                            style={{ background: '#FCF9F2', borderColor: '#E8E3D8', color: '#16163D', minWidth: 0 }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF2A6D' }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E3D8' }}
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-[10px] border-none text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all font-inherit text-white"
                            style={{ background: '#FF2A6D' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#E61D5C' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      {claimError && (
                        <p className="text-[11px] mt-1.5" style={{ color: '#FF2A6D' }}>{claimError}</p>
                      )}
                    </form>
                  )}
                  {result && emailSent && (
                    <div className="mt-4 p-4 rounded-[14px] border text-center"
                      style={{ background: 'rgba(255, 42, 109, 0.03)', borderColor: '#F0EDE4' }}>
                      <span className="text-[13px] font-medium" style={{ color: '#4A4A6A' }}>
                        ✅ We&apos;ll notify you at <strong style={{ color: '#16163D' }}>{emailValue}</strong> when this link is visited.
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#8B8BA8' }}>or paste manually</span>
                  <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your knowledge here..."
                  maxLength={50000}
                  rows={3}
                  className="w-full p-3.5 rounded-[14px] text-sm leading-relaxed outline-none resize-y transition-all font-inherit"
                  style={{
                    background: '#FCF9F2',
                    border: '1px solid #E8E3D8',
                    color: '#16163D',
                    minHeight: 70,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 42, 109, 0.12)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.boxShadow = 'none' }}
                />

                {/* Input bar */}
                <div className="flex items-center justify-between mt-2.5">
                  <button
                    onClick={handleCreate}
                    disabled={pending || generating}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[14px] font-semibold border-none cursor-pointer transition-all font-inherit"
                    style={{
                      background: '#FF2A6D',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(255, 42, 109, 0.25)',
                      opacity: pending || generating ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => { if (!pending && !generating) { e.currentTarget.style.background = '#E61D5C'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255, 42, 109, 0.35)' } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 42, 109, 0.25)' }}
                  >
                    {generating ? (
                      <>
                        <span className="inline-block w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                        Generating...
                      </>
                    ) : pending ? (
                      <>
                        <span className="inline-block w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Create
                      </>
                    )}
                  </button>
                  <span className="text-xs font-medium" style={{
                    color: charCount > 4500 ? '#FF2A6D' : '#8B8BA8',
                  }}>
                    {charCount} / 50000
                  </span>
                </div>

                {error && (
                  <p className="text-xs mt-2" style={{ color: '#FF2A6D' }}>{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <div className="relative z-10 h-px max-w-[1200px] mx-auto"
        style={{ background: 'linear-gradient(90deg, transparent, #E8E3D8, transparent)' }} />

      <section id="how" className="relative z-10 px-6 py-[80px] max-w-[1200px] mx-auto w-full"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FCF9F2' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FF2A6D', letterSpacing: '0.12em' }}>
          How It Works
        </div>
        <h2 className="font-heading font-bold leading-tight tracking-[-0.02em] mb-3" style={{
          fontSize: 'clamp(32px, 3.5vw, 48px)',
          color: '#16163D',
        }}>
          Write. <span className="italic" style={{ color: '#FF2A6D' }}>Share.</span> Discuss.
        </h2>
        <p className="text-base leading-relaxed max-w-[480px]" style={{ color: '#4A4A6A' }}>
          Three seconds to share your thinking. One click for anyone to explore it with AI.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[{
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ),
            title: 'Write or paste',
            desc: 'Type or paste your knowledge into the box. A brief, a research note, a meeting recap — anything you need to share. No account required.',
          }, {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            ),
            title: 'Get a short link',
            desc: 'Hit "Create" and you get a contxt.to short link instantly. Drop it in Slack, email, or a doc — the link preview already shows the summary.',
          }, {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polygon points="11 5 6 9 2 8 14 2 18 6 12 12 14 18 10 14 22 22" />
              </svg>
            ),
            title: 'Continue in any AI',
            desc: 'Recipients open the link, see the gist, and tap "Continue in ChatGPT" or "Gemini" — full context flows into their chat. Instant discussion.',
          }].map((step, i) => (
            <div key={i}
              className="anim-up rounded-[24px] border p-8 shadow-sm transition-all"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 4px 20px rgba(22, 22, 61, 0.06)',
                '--delay': `${0.1 + i * 0.1}s`,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(22, 22, 61, 0.1)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(22, 22, 61, 0.06)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-[18px]"
                style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#16163D' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4A6A' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE EXPERIENCE ═══ */}
      <div className="relative z-10 px-6 py-[80px]" style={{ background: '#F5F0E6' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FF2A6D', letterSpacing: '0.12em' }}>
            The Experience
          </div>

          <div className="grid lg:grid-cols-2 gap-[60px] items-start mt-12">
            {/* Left: Description */}
            <div className="anim-up space-y-6">
              <h2 className="font-heading font-bold leading-tight tracking-[-0.02em]" style={{
                fontSize: 'clamp(28px, 3vw, 42px)',
                color: '#16163D',
              }}>
                <em className="italic" style={{ color: '#FF2A6D' }}>One</em> link.{' '}
                <em className="italic" style={{ color: '#FF2A6D' }}>Two</em> views.
              </h2>
              <p className="text-[15px] leading-relaxed max-w-[420px]" style={{ color: '#4A4A6A' }}>
                Your recipient opens a short link, sees the core idea in seconds,
                and can instantly dive into it — with AI carrying all the context.
                The same link adapts to whoever opens it.
              </p>

              {/* Browser experience card */}
              <div className="rounded-[16px] border p-5" style={{ background: '#FFFFFF', borderColor: '#F0EDE4' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: 'rgba(255, 42, 109, 0.06)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF2A6D" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                      <line x1="21.17" y1="8" x2="12" y2="8" />
                      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#16163D' }}>Browser View</div>
                    <div className="text-xs" style={{ color: '#8B8BA8' }}>For humans reading on the web</div>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#4A4A6A' }}>
                  Rich card layout with title, summary, and full context.
                  One click sends everything into ChatGPT, Gemini, or Claude —
                   no copy-paste needed.
                </p>
              </div>

              {/* AI experience card */}
              <div className="rounded-[16px] border p-5" style={{ background: '#FFFFFF', borderColor: '#F0EDE4' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: 'rgba(255, 42, 109, 0.06)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF2A6D" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#16163D' }}>AI Agent View</div>
                    <div className="text-xs" style={{ color: '#8B8BA8' }}>For AI crawlers reading programmatically</div>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#4A4A6A' }}>
                  Structured YAML frontmatter with title, description, and raw content.
                  AI agents (ChatGPT, Gemini, Claude crawlers) get plain text they
                  can parse and act on immediately.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  'Same short link, two different rendering paths',
                  'AI agents get clean YAML with no HTML/CSS noise',
                  'Works with ChatGPT, Gemini, Claude, and all major crawlers',
                  'Smart previews for sharing on Slack, email, and docs',
                  'Private by default — nothing is public without you sending the link',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                    <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
                      style={{ background: '#FF2A6D' }}>
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Two mockups stacked */}
            <div className="space-y-6">
              {/* Browser mockup */}
              <div className="anim-up rounded-[24px] border overflow-hidden shadow-lg"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#F0EDE4',
                  boxShadow: '0 24px 60px rgba(22, 22, 61, 0.12)',
                }}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ background: '#FCF9F2', borderColor: '#F0EDE4' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
                  <span className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-[11px] text-center border"
                    style={{ background: '#FFFFFF', borderColor: '#F0EDE4', color: '#8B8BA8' }}>
                    contxt.to/s/aK3mQ
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                    Browser
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-heading text-[20px] font-bold leading-tight mb-2" style={{ color: '#16163D' }}>
                    Product Design Sprint Retro — Q1 2026
                  </h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#4A4A6A' }}>
                    We ran 3 design sprints this quarter. Key wins: the onboarding
                    redesign tested at 87% usability (up from 62%). Key misses: the
                    analytics dashboard overhaul needs another iteration.
                  </p>
                  <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: '#F0EDE4' }}>
                    <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] text-[11px] font-semibold border"
                      style={{ background: '#FCF9F2', borderColor: '#E8E3D8', color: '#4A4A6A' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.281 2.719a3 3 0 0 0-3.04-.602L3.166 8.356a3 3 0 0 0-.16 5.528l6.047 3.14 3.142 6.046a3 3 0 0 0 5.528-.16l6.24-18.074a3 3 0 0 0-.602-3.04z" />
                      </svg>
                      Continue in ChatGPT
                    </span>
                    <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] text-[11px] font-semibold border"
                      style={{ background: '#FCF9F2', borderColor: '#E8E3D8', color: '#4A4A6A' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Continue in Gemini
                    </span>
                  </div>
                </div>
              </div>

              {/* AI YAML mockup */}
              <div className="anim-up rounded-[24px] overflow-hidden shadow-lg"
                style={{ '--delay': '0.2s', boxShadow: '0 24px 60px rgba(22, 22, 61, 0.18)' } as React.CSSProperties}>
                {/* Terminal title bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b"
                  style={{ background: '#16163D', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
                  <span className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-center text-[10px] border"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                    contxt.to/s/aK3mQ (AI Agent)
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.6)' }}>
                    AI View
                  </span>
                </div>
                {/* Code body */}
                <div className="p-5 font-mono text-[12px] leading-[1.7] overflow-x-auto"
                  style={{ background: '#1a1a2e' }}>
                  <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
                  <div><span style={{ color: '#FF79C6' }}>name</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>Product Design Sprint Retro — Q1 2026</span></div>
                  <div><span style={{ color: '#FF79C6' }}>description</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>&gt; Summary of 3 design sprints this quarter. Key</span></div>
                  <div style={{ color: '#F1FA8C', paddingLeft: '13px' }}>wins: onboarding hit 87% usability.</div>
                  <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
                  <div style={{ color: '#6c6c8a', margin: '6px 0' }}># AI reads this block as the full context body</div>
                  <div><span style={{ color: '#6272A4' }}>We ran 3 design sprints this quarter. Key wins: the</span></div>
                  <div><span style={{ color: '#6272A4' }}>onboarding redesign tested at 87% usability</span></div>
                  <div><span style={{ color: '#6272A4' }}>(up from 62%). Key misses...</span></div>
                  <div style={{ color: '#6c6c8a', marginTop: '6px' }}>{'─'.repeat(40)}</div>
                  <div style={{ color: '#50FA7B', marginTop: '6px' }}># AI agents get structured YAML — parse with any YAML library</div>
                </div>
              </div>

              {/* Visual connector */}
              <div className="flex items-center justify-center gap-3 text-xs font-medium" style={{ color: '#8B8BA8' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                  🌐
                </span>
                <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="#E8E3D8" strokeWidth="1" strokeDasharray="4 3"/></svg>
                <span className="font-semibold" style={{ color: '#FF2A6D' }}>same link</span>
                <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="#E8E3D8" strokeWidth="1" strokeDasharray="4 3"/></svg>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                  {'<'}/&gt;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ USE CASES ═══ */}
      <section id="use" className="relative z-10 px-6 py-[80px] max-w-[1200px] mx-auto w-full"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FCF9F2' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FF2A6D', letterSpacing: '0.12em' }}>
          Use Cases
        </div>
        <h2 className="font-heading font-bold leading-tight tracking-[-0.02em] mb-3" style={{
          fontSize: 'clamp(32px, 3.5vw, 48px)',
          color: '#16163D',
        }}>
          Context, <span className="italic" style={{ color: '#FF2A6D' }}>everywhere</span> it matters.
        </h2>
        <p className="text-base leading-relaxed max-w-[480px] mb-12" style={{ color: '#4A4A6A' }}>
          From RFCs to investor updates — whenever the backstory is half the conversation.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { emoji: '🏗️', title: 'Engineering RFCs', desc: 'Share an architecture decision in a single link. Reviewers see the summary instantly, then discuss with AI — exploring tradeoffs or questioning assumptions.' },
            { emoji: '📊', title: 'Meeting Recaps', desc: 'After any meeting, drop a Contxt link into Slack. Teammates catch up in ten seconds, then ask AI to dive deeper into any point they missed.' },
            { emoji: '🤝', title: 'Investor Updates', desc: 'Send a Contxt of your monthly update. Investors get the key metrics in seconds, then drill down with AI — without digging through attachments.' },
            { emoji: '📝', title: 'Research Briefs', desc: 'Share a competitive analysis or literature review as a link. Colleagues consume the synthesis instantly, then ask AI for deeper context or counter-arguments.' },
          ].map((item, i) => (
            <div key={i}
              className="anim-up rounded-[24px] border p-7 shadow-sm transition-all"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 4px 20px rgba(22, 22, 61, 0.06)',
                '--delay': `${0.1 + i * 0.08}s`,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(22, 22, 61, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(22, 22, 61, 0.06)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div className="text-2xl mb-3.5">{item.emoji}</div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: '#16163D' }}>{item.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#4A4A6A' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-8 border-t text-[13px]"
        style={{ borderColor: '#F0EDE4', color: '#8B8BA8', background: '#FCF9F2' }}>
        <span>© 2026 <a href="/" className="no-underline font-medium transition-colors" style={{ color: '#4A4A6A' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Contxt</a></span>
        <div className="flex gap-6">
          <a href="/privacy" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Privacy</a>
          <a href="/terms" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Terms</a>
          <a href="/contributing" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Contributing</a>
          <a href="/changelog" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Changelog</a>
          <a href="mailto:hello@contxt.to" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Contact</a>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        .anim-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--delay, 0s);
        }
        .anim-up.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
