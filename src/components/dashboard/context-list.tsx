"use client"

import { useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Copy, FileText } from "lucide-react"
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

interface ContextListProps {
  contexts: DashboardContext[]
  selectedSlug: string | null
  searchQuery: string
}

export function ContextList({ contexts, selectedSlug, searchQuery }: ContextListProps) {
  const router = useRouter()
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(searchQuery))
  const [, setSlug] = useQueryState("slug", parseAsString)
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
      setSlug(slug)
    },
    [setSlug]
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

  // Stats
  const totalCount = contexts.length
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
      {/* Search header */}
      <div className="shrink-0 border-b border-[#F0EDE4] p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B8BA8] pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search your contexts…"
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-[#F0EDE4] bg-[#FCF9F2] py-2 pl-8 pr-3 text-sm text-[#16163D] placeholder:text-[#8B8BA8] outline-none focus:border-[#FF2A6D] focus:ring-2 focus:ring-[rgba(255,42,109,0.1)] transition-colors"
            />
          </div>
          <Link
            href="/dashboard/contexts/new"
            className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F0EDE4] text-[#4A4A6A] hover:bg-[#F5F0E6] hover:text-[#FF2A6D] transition-all no-underline"
            aria-label="New context"
          >
            <Plus size={16} />
          </Link>
        </div>
        {q && (
          <p className="mt-1.5 text-[11px] text-[#8B8BA8]">
            {contexts.length} result{contexts.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>

      {/* Mini stats bar */}
      <div className="shrink-0 flex items-center gap-4 border-b border-[#F0EDE4] bg-[#FCF9F2] px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#4A4A6A]">
          <FileText size={12} className="text-[#8B8BA8]" />
          <span className="font-semibold">{totalCount}</span>
          <span className="text-[#8B8BA8]">total</span>
        </div>
        {todayCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#4A4A6A]">
            <span className="font-semibold text-[#FF2A6D]">+{todayCount}</span>
            <span className="text-[#8B8BA8]">today</span>
          </div>
        )}
      </div>

      {/* Context list */}
      <div className="flex-1 overflow-y-auto">
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
                  className="text-xs font-medium text-[#FF2A6D] hover:opacity-80 transition-opacity"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#4A4A6A] mb-1">No contexts yet</p>
                <p className="text-xs text-[#8B8BA8] mb-3">Create your first shareable link</p>
                <Link
                  href="/dashboard/contexts/new"
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
          <ul className="divide-y divide-[#F0EDE4]">
            {contexts.map((ctx) => {
              const isSelected = ctx.slug === selectedSlug
              return (
                <li key={ctx.id}>
                  <button
                    onClick={() => handleSelect(ctx.slug)}
                    className={`w-full text-left block px-3 sm:px-4 py-3 sm:py-2.5 transition-colors hover:bg-[#F5F0E6] ${
                      isSelected
                        ? "border-l-2 border-l-[#FF2A6D] bg-[rgba(255,42,109,0.04)] pl-[11px] sm:pl-[14px]"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <p className="mb-0.5 line-clamp-1 text-sm font-semibold text-[#16163D]">
                      {ctx.title}
                    </p>
                    <p className="mb-1.5 line-clamp-2 text-xs text-[#4A4A6A] leading-relaxed">
                      {ctx.summary}
                    </p>
                    {/* Short link row */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[11px] font-mono text-[#8B8BA8] truncate">
                        contxt.to/s/{ctx.slug}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyLink(ctx.slug)
                        }}
                        className="shrink-0 flex items-center justify-center text-[#8B8BA8] hover:text-[#FF2A6D] transition-colors p-0.5"
                        aria-label="Copy link"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-[10px] text-[#8B8BA8]">
                      <span>{relativeTime(ctx.createdAt)}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
