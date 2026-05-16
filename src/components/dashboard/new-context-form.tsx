"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserContext } from "@/actions/dashboard-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function NewContextForm() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters")
      return
    }

    setPending(true)
    setGenerating(true)
    setError(null)

    try {
      const metaRes = await fetch("/api/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!metaRes.ok) throw new Error("Failed to generate metadata")
      const meta = await metaRes.json()
      setGenerating(false)

      const res = await createUserContext({
        title: meta.title,
        summary: meta.summary,
        content,
      })

      if (res.success) {
        router.push(`/dashboard?slug=${res.slug}`)
      } else {
        setError(res.error)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setPending(false)
      setGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#16163D]">
          Your Context
        </label>
        <Textarea
          placeholder="Paste or write your content here. Supports **markdown**, lists, code blocks, etc."
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={pending}
        />
        <p className="text-xs text-[#8B8BA8]">
          AI will automatically generate a title and summary.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-lg bg-[#F5F0E6] px-3.5 py-2 text-xs text-[#4A4A6A] flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#8B8BA8]">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Saved to your account
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={pending}
        >
          {generating
            ? "✨ Generating title & summary…"
            : pending
              ? "Creating…"
              : "✦ Create Context"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/dashboard")}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
