"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
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
}

export function ContextList({ contexts, selectedSlug }: ContextListProps) {
  const [query, setQuery] = useState("")

  const filtered = query
    ? contexts.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.summary.toLowerCase().includes(query.toLowerCase())
      )
    : contexts

  return (
    <div className="flex w-[300px] shrink-0 flex-col border-r border-[#F0EDE4] bg-white">
      <div className="shrink-0 border-b border-[#F0EDE4] p-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B8BA8]"
          />
          <input
            type="search"
            placeholder="Search your contexts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#F0EDE4] bg-[#FCF9F2] py-1.5 pl-8 pr-3 text-sm text-[#16163D] placeholder:text-[#8B8BA8] outline-none focus:border-[#FF2A6D] focus:ring-2 focus:ring-[rgba(255,42,109,0.1)] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-[#8B8BA8]">
              {query ? "No matching contexts" : "No contexts yet"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0EDE4]">
            {filtered.map((ctx) => {
              const isSelected = ctx.slug === selectedSlug
              return (
                <li key={ctx.id}>
                  <Link
                    href={`?slug=${ctx.slug}`}
                    className={`block px-4 py-3 transition-colors hover:bg-[#F5F0E6] ${
                      isSelected
                        ? "border-l-2 border-l-[#FF2A6D] bg-[rgba(255,42,109,0.04)] pl-[14px]"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <p className="mb-1 line-clamp-1 text-sm font-semibold text-[#16163D]">
                      {ctx.title}
                    </p>
                    <p className="mb-2 line-clamp-2 text-xs text-[#4A4A6A]">
                      {ctx.summary}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8B8BA8]">
                      <span>0 views</span>
                      <span>·</span>
                      <span>{relativeTime(ctx.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
