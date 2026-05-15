'use client'

import { useState } from 'react'

const TABS = [
  {
    id: 'browser',
    label: 'For People',
    subtitle: 'Browser View',
  },
  {
    id: 'ai',
    label: 'For AI',
    subtitle: 'Agent View',
  },
  {
    id: 'developer',
    label: 'For Developers',
    subtitle: 'Under the Hood',
  },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Brand colors ──────────────────────────────────────────────
const COLORS = {
  cream: '#FCF9F2',
  navy: '#16163D',
  rose: '#FF2A6D',
  muted: '#4A4A6A',
  beige: '#F5F0E6',
  border: '#F0EDE4',
  mutedText: '#8B8BA8',
  borderLight: '#E8E3D8',
} as const

// ── Shared sub-components ────────────────────────────────────

function CheckmarkList() {
  const items = [
    'Same short link, two different rendering paths',
    'AI agents get clean YAML with no HTML/CSS noise',
    'Works with ChatGPT, Gemini, Claude, and all major crawlers',
    'Smart previews for sharing on Slack, email, and docs',
    'Private by default — nothing is public without you sending the link',
  ]

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 text-sm" style={{ color: COLORS.muted }}>
          <span
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
            style={{ background: COLORS.rose }}
          >
            ✓
          </span>
          {item}
        </div>
      ))}
    </div>
  )
}

function SameLinkConnector() {
  return (
    <div className="flex items-center justify-center gap-3 text-xs font-medium" style={{ color: COLORS.mutedText }}>
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: 'rgba(255, 42, 109, 0.06)', color: COLORS.rose }}
      >
        🌐
      </span>
      <svg width="40" height="2" viewBox="0 0 40 2">
        <line x1="0" y1="1" x2="40" y2="1" stroke={COLORS.borderLight} strokeWidth="1" strokeDasharray="4 3" />
      </svg>
      <span className="font-semibold" style={{ color: COLORS.rose }}>
        same link
      </span>
      <svg width="40" height="2" viewBox="0 0 40 2">
        <line x1="0" y1="1" x2="40" y2="1" stroke={COLORS.borderLight} strokeWidth="1" strokeDasharray="4 3" />
      </svg>
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: 'rgba(255, 42, 109, 0.06)', color: COLORS.rose }}
      >
        {'<'}/&gt;
      </span>
    </div>
  )
}

// ── Mockup: Browser card ─────────────────────────────────────

function BrowserMockup() {
  return (
    <div
      className="rounded-[24px] border overflow-hidden shadow-lg"
      style={{
        background: '#FFFFFF',
        borderColor: COLORS.border,
        boxShadow: '0 24px 60px rgba(22, 22, 61, 0.12)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 border-b"
        style={{ background: COLORS.cream, borderColor: COLORS.border }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span
          className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-[11px] text-center border"
          style={{ background: '#FFFFFF', borderColor: COLORS.border, color: COLORS.mutedText }}
        >
          contxt.to/s/aK3mQ
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255, 42, 109, 0.06)', color: COLORS.rose }}
        >
          Browser
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h4
          className="font-heading text-[20px] font-bold leading-tight mb-2"
          style={{ color: COLORS.navy }}
        >
          Product Design Sprint Retro — Q1 2026
        </h4>
        <p className="text-[13px] leading-relaxed" style={{ color: COLORS.muted }}>
          We ran 3 design sprints this quarter. Key wins: the onboarding redesign tested
          at 87% usability (up from 62%). Key misses: the analytics dashboard overhaul
          needs another iteration.
        </p>
        <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
          <span
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] text-[11px] font-semibold border cursor-pointer transition-colors"
            style={{ background: COLORS.cream, borderColor: COLORS.borderLight, color: COLORS.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.rose
              e.currentTarget.style.color = COLORS.rose
              e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.borderLight
              e.currentTarget.style.color = COLORS.muted
              e.currentTarget.style.background = COLORS.cream
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.281 2.719a3 3 0 0 0-3.04-.602L3.166 8.356a3 3 0 0 0-.16 5.528l6.047 3.14 3.142 6.046a3 3 0 0 0 5.528-.16l6.24-18.074a3 3 0 0 0-.602-3.04z" />
            </svg>
            Continue in ChatGPT
          </span>
          <span
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] text-[11px] font-semibold border cursor-pointer transition-colors"
            style={{ background: COLORS.cream, borderColor: COLORS.borderLight, color: COLORS.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.rose
              e.currentTarget.style.color = COLORS.rose
              e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.borderLight
              e.currentTarget.style.color = COLORS.muted
              e.currentTarget.style.background = COLORS.cream
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Continue in Gemini
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Mockup: AI Terminal (YAML) ───────────────────────────────

function AITerminalMockup() {
  return (
    <div
      className="rounded-[24px] overflow-hidden shadow-lg"
      style={{ boxShadow: '0 24px 60px rgba(22, 22, 61, 0.18)' }}
    >
      {/* Terminal title bar */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ background: COLORS.navy, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span
          className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-center text-[10px] border"
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          contxt.to/s/aK3mQ (AI Agent)
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.6)' }}
        >
          AI View
        </span>
      </div>

      {/* Code body */}
      <div
        className="p-5 font-mono text-[12px] leading-[1.7] overflow-x-auto"
        style={{ background: '#1a1a2e' }}
      >
        <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
        <div>
          <span style={{ color: '#FF79C6' }}>name</span>
          <span style={{ color: '#fff' }}>:</span>{' '}
          <span style={{ color: '#F1FA8C' }}>Product Design Sprint Retro — Q1 2026</span>
        </div>
        <div>
          <span style={{ color: '#FF79C6' }}>description</span>
          <span style={{ color: '#fff' }}>:</span>{' '}
          <span style={{ color: '#F1FA8C' }}>&gt; Summary of 3 design sprints this quarter. Key</span>
        </div>
        <div style={{ color: '#F1FA8C', paddingLeft: '13px' }}>wins: onboarding hit 87% usability.</div>
        <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#6c6c8a', margin: '6px 0' }}># AI reads this block as the full context body</div>
        <div>
          <span style={{ color: '#6272A4' }}>We ran 3 design sprints this quarter. Key wins: the</span>
        </div>
        <div>
          <span style={{ color: '#6272A4' }}>onboarding redesign tested at 87% usability</span>
        </div>
        <div>
          <span style={{ color: '#6272A4' }}>(up from 62%). Key misses...</span>
        </div>
        <div style={{ color: '#6c6c8a', marginTop: '6px' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#50FA7B', marginTop: '6px' }}>
          # AI agents get structured YAML — parse with any YAML library
        </div>
      </div>
    </div>
  )
}

// ── Developer content panel ──────────────────────────────────

function DeveloperPanel() {
  const items = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
      title: 'User-Agent detection via middleware',
      desc: 'Detects AI crawlers (ChatGPT, Gemini, Claude) at the edge using User-Agent headers. No client-side sniffing — the decision happens before any HTML is served.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: 'AI agents get clean YAML',
      desc: 'When an AI crawler hits a contxt.to link, they receive structured YAML frontmatter with title, description, and raw content — no HTML, no CSS, no JavaScript noise.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: 'Works with ChatGPT, Gemini, Claude crawlers',
      desc: 'Tested and compatible with all major AI platform crawlers. Each gets the same clean YAML format — parse once, work everywhere.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      title: 'Same link → different rendering paths',
      desc: 'A single contxt.to/s/... URL serves rich HTML to browsers and structured YAML to AI agents. The rendering path is chosen server-side based on the visitor type.',
    },
  ]

  return (
    <div
      className="rounded-[24px] border overflow-hidden shadow-lg"
      style={{
        background: '#FFFFFF',
        borderColor: COLORS.border,
        boxShadow: '0 24px 60px rgba(22, 22, 61, 0.12)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 border-b"
        style={{ background: COLORS.navy, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span
          className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-center text-[10px] border"
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          contxt.to/s/aK3mQ
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.6)' }}
        >
          System
        </span>
      </div>

      {/* Technical details */}
      <div className="p-5 space-y-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold w-fit"
          style={{ background: 'rgba(255, 42, 109, 0.06)', color: COLORS.rose }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          Request Handling
        </div>

        {items.map((item, i) => (
          <div key={i} className="flex gap-3.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(255, 42, 109, 0.06)', color: COLORS.rose }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-bold mb-1" style={{ color: COLORS.navy }}>
                {item.title}
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: COLORS.muted }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}

        {/* Code snippet */}
        <div
          className="rounded-[12px] p-4 font-mono text-[11px] leading-[1.6] overflow-x-auto border"
          style={{
            background: '#1a1a2e',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ color: '#6c6c8a' }}># middleware.ts</div>
          <div style={{ color: '#6c6c8a' }}>{'─'.repeat(35)}</div>
          <div>
            <span style={{ color: '#FF79C6' }}>if</span>{' '}
            <span style={{ color: '#F1FA8C' }}>isAiAgent</span>
            <span style={{ color: '#fff' }}>(</span>
            <span style={{ color: '#8BE9FD' }}>request</span>
            <span style={{ color: '#fff' }}>)</span>
            <span style={{ color: '#fff' }}> {'{'}</span>
          </div>
          <div style={{ paddingLeft: '16px' }}>
            <span style={{ color: '#6272A4' }}>response</span>
            <span style={{ color: '#FF79C6' }}>.</span>
            <span style={{ color: '#50FA7B' }}>headers</span>
            <span style={{ color: '#FF79C6' }}>.</span>
            <span style={{ color: '#50FA7B' }}>set</span>
            <span style={{ color: '#F1FA8C' }}>(</span>
            <span style={{ color: '#F1FA8C' }}>&apos;content-type&apos;</span>
            <span style={{ color: '#FF79C6' }}>,</span>
          </div>
          <div style={{ paddingLeft: '30px' }}>
            <span style={{ color: '#F1FA8C' }}>&apos;text/yaml&apos;</span>
            <span style={{ color: '#F1FA8C' }}>)</span>
          </div>
          <div style={{ color: '#fff' }}>{'}'}</div>
        </div>
      </div>
    </div>
  )
}

// ── Main TabbedExperience Component ──────────────────────────

export function TabbedExperience() {
  const [activeTab, setActiveTab] = useState<TabId>('browser')

  const renderMockup = () => {
    switch (activeTab) {
      case 'browser':
        return <BrowserMockup />
      case 'ai':
        return <AITerminalMockup />
      case 'developer':
        return <DeveloperPanel />
      default:
        return <BrowserMockup />
    }
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case 'browser':
        return {
          title: 'Rich card layout with title, summary, and full context.',
          desc: 'One click sends everything into ChatGPT, Gemini, or Claude — no copy-paste needed.',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.rose} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" y1="8" x2="12" y2="8" />
              <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
              <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
            </svg>
          ),
        }
      case 'ai':
        return {
          title: 'Structured YAML frontmatter with title, description, and raw content.',
          desc: 'AI agents (ChatGPT, Gemini, Claude crawlers) get plain text they can parse and act on immediately.',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.rose} strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          ),
        }
      case 'developer':
        return {
          title: 'Edge middleware detects AI crawlers and serves the right format.',
          desc: 'No client-side JavaScript, no redirects — the rendering path is chosen server-side before any response is sent.',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.rose} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          ),
        }
      default:
        return { title: '', desc: '', icon: null }
    }
  }

  const tabInfo = getTabDescription()

  return (
    <div className="relative z-10 px-6 py-[80px]" style={{ background: COLORS.beige }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section label */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: COLORS.rose, letterSpacing: '0.12em' }}
        >
          The Experience
        </div>

        <div className="grid lg:grid-cols-2 gap-[60px] items-start mt-12">
          {/* ── LEFT: Tab bar + description + feature list ── */}
          <div className="anim-up space-y-6">
            <h2
              className="font-heading font-bold leading-tight tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(28px, 3vw, 42px)',
                color: COLORS.navy,
              }}
            >
              <em className="italic" style={{ color: COLORS.rose }}>
                One
              </em>{' '}
              link.{' '}
              <em className="italic" style={{ color: COLORS.rose }}>
                Two
              </em>{' '}
              views.
            </h2>
            <p
              className="text-[15px] leading-relaxed max-w-[420px]"
              style={{ color: COLORS.muted }}
            >
              Your recipient opens a short link, sees the core idea in seconds, and can
              instantly dive into it — with AI carrying all the context. The same link
              adapts to whoever opens it.
            </p>

            {/* ── Pill-shaped tab bar ── */}
            <div
              className="inline-flex rounded-full p-1 gap-1 border"
              style={{
                background: COLORS.cream,
                borderColor: COLORS.border,
              }}
              role="tablist"
              aria-label="View switcher"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-5 py-2.5 rounded-full text-[13px] font-semibold border-none cursor-pointer transition-all font-inherit whitespace-nowrap"
                    style={{
                      background: isActive ? COLORS.rose : 'transparent',
                      color: isActive ? '#fff' : COLORS.muted,
                      boxShadow: isActive ? '0 2px 12px rgba(255, 42, 109, 0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = COLORS.rose
                        e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = COLORS.muted
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {tab.label}
                    {/* Show subtitle on desktop only */}
                    <span className="hidden sm:inline ml-1 text-[11px] font-normal opacity-70">
                      · {tab.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active tab description card */}
            <div
              className="rounded-[16px] border p-5"
              style={{ background: '#FFFFFF', borderColor: COLORS.border }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'rgba(255, 42, 109, 0.06)' }}
                >
                  {tabInfo.icon}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.navy }}>
                    {activeTab === 'browser'
                      ? 'Browser View'
                      : activeTab === 'ai'
                        ? 'AI Agent View'
                        : 'Developer View'}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.mutedText }}>
                    {activeTab === 'browser'
                      ? 'For humans reading on the web'
                      : activeTab === 'ai'
                        ? 'For AI crawlers reading programmatically'
                        : 'For builders integrating with contxt.to'}
                  </div>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed mb-1" style={{ color: COLORS.muted }}>
                {tabInfo.title}
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: COLORS.muted }}>
                {tabInfo.desc}
              </p>
            </div>

            <CheckmarkList />
          </div>

          {/* ── RIGHT: Active mockup + connector ── */}
          <div className="space-y-6">
            {/* Key for re-triggering mount animation on tab switch */}
            <div key={activeTab} className="anim-up">
              {renderMockup()}
            </div>

            {/* Hide connector for developer tab */}
            {activeTab !== 'developer' && <SameLinkConnector />}
          </div>
        </div>
      </div>
    </div>
  )
}
