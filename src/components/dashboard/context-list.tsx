"use client"

import { useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Copy, FileText, Link2 } from "lucide-react"
import { useQueryState } from "nuqs"
import { parseAsString } from "nuqs"
import { toast } from "sonner"
import type { DashboardContext } from "@/actions/dashboard-context"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []
  }
}

interface ContextListProps {
  contexts: DashboardContext[]
  selectedSlug: string | null
  searchQuery: string
}

export function ContextList({ contexts, selectedSlug, searchQuery }: ContextListProps) {
  const router = useRouter()
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(searchQuery))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      setQ(value || null)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        router.refresh()
      }, 300)
    },
    [setQ, router]
  )

  const handleSelect = useCallback(
    (slug: string) => {
      router.push(`/dashboard?act=view&slug=${slug}`)
    },
    [router]
  )

  async function copyLink(slug: string) {
    const url = `https://contxt.to/s/${slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    toast.success("Link copied!", { duration: 1500 })
  }

  const todayCount = useMemo(
    () =>
      contexts.filter((c) => {
        const d = new Date(c.createdAt)
        const now = new Date()
        return d.toDateString() === now.toDateString()
      }).length,
    [contexts]
  )

  return (
    <div className="flex w-full flex-col border-r border-[#F0EDE4] bg-white">
      {/* Header: "Contexts N" + "+" button — matching mockup */}
      <div className="shrink-0 border-b border-[#E8E3D8] px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2
              className="text-base font-semibold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#16163D",
                letterSpacing: "-0.01em",
              }}
            >
              Contexts{" "}
              <span style={{ fontSize: "13px", fontWeight: 400, color: "#8B8BA8", marginLeft: "4px" }}>
                {contexts.length}
              </span>
            </h2>
            <p className="text-[11px] text-[#8B8BA8] mt-0.5">
              {todayCount > 0 && `+${todayCount} today`}
            </p>
          </div>
          <Link
            href="/dashboard?act=create"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#F0EDE4] text-[#4A4A6A] hover:bg-[#FCF9F2] hover:text-[#FF2A6D] hover:border-[#FF2A6D] transition-all no-underline"
            aria-label="New context"
          >
            <Plus size={14} />
          </Link>
        </div>
      </div>

      {/* Search — matching mockup */}
      <div className="shrink-0 px-5 py-2.5">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B8BA8] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search your contexts…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-md border border-[#F0EDE4] bg-[#FCF9F2] py-[7px] pl-[30px] pr-3 text-xs text-[#16163D] placeholder:text-[#8B8BA8] outline-none focus:border-[#FF2A6D] transition-colors"
          />
        </div>
        {q && (
          <p className="mt-1.5 text-[11px] text-[#8B8BA8]">
            {contexts.length} result{contexts.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>

      {/* Context list — card-style items with icons matching mockup */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {contexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 px-6 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B8BA8" strokeWidth="1.5" strokeLinecap="round" className="mb-3">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            {q ? (
              <>
                <p className="text-sm text-[#8B8BA8] mb-1">No matching contexts</p>
                <button
                  onClick={() => handleSearch("")}
                  className="text-xs font-medium text-[#FF2A6D] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#4A4A6A] mb-1">No contexts yet</p>
                <p className="text-xs text-[#8B8BA8] mb-3">Create your first shareable link</p>
                <Link
                  href="/dashboard?act=create"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white no-underline transition-all hover:opacity-90"
                  style={{ background: '#FF2A6D' }}
                >
                  <Plus size={13} />
                  New Context
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {contexts.map((ctx) => {
              const isSelected = ctx.slug === selectedSlug
              const tags = parseTags(ctx.tags)
              return (
                <button
                  key={ctx.id}
                  onClick={() => handleSelect(ctx.slug)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer border-l-3 ${
                    isSelected
                      ? "bg-[rgba(255,42,109,0.04)] border-l-[#FF2A6D]"
                      : "hover:bg-[#FCF9F2] border-l-transparent"
                  }`}
                >
                  {/* Icon — matching mockup */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      isSelected ? "bg-[rgba(255,42,109,0.08)]" : "bg-[#FCF9F2]"
                    }`}
                  >
                    <Link2 size={14} className={isSelected ? "text-[#FF2A6D]" : "text-[#4A4A6A]"} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-[#16163D] truncate leading-snug">
                      {ctx.title}
                    </p>
                    <p className="text-[11px] text-[#8B8BA8] truncate mt-0.5 leading-relaxed">
                      {ctx.summary}
                    </p>
                    {/* Meta row — matching mockup */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#8B8BA8]">{relativeTime(ctx.createdAt)}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyLink(ctx.slug)
                        }}
                        className="flex items-center gap-1 text-[10px] font-medium text-[#8B8BA8] hover:text-[#FF2A6D] transition-colors cursor-pointer"
                        aria-label="Copy link"
                      >
                        <Copy size={9} />
                        Copy
                      </button>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
