"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateContext } from "@/actions/dashboard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DashboardContext } from "@/actions/dashboard-context"

interface EditContextFormProps {
  context: DashboardContext
}

export function EditContextForm({ context }: EditContextFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(context.title)
  const [summary, setSummary] = useState(context.summary)
  const [content, setContent] = useState(context.content)
  const [tags, setTags] = useState(() => {
    try {
      const parsed = JSON.parse(context.tags)
      return Array.isArray(parsed) ? parsed.join(", ") : ""
    } catch {
      return ""
    }
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || title.length < 2) {
      setError("Title must be at least 2 characters")
      return
    }
    if (!summary.trim() || summary.length < 10) {
      setError("Summary must be at least 10 characters")
      return
    }
    if (!content.trim() || content.length < 10) {
      setError("Content must be at least 10 characters")
      return
    }

    setPending(true)
    setError(null)

    try {
      const result = await updateContext(context.id, { title, summary, content, tags })
      router.push(`/dashboard?slug=${result.slug}`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes")
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#16163D]">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Context title"
          disabled={pending}
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#16163D]">Summary</label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A short summary of the context"
          rows={3}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#16163D]">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Full context content (markdown supported)"
          rows={12}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#16163D]">
          Tags{" "}
          <span className="font-normal text-[#8B8BA8]">(comma-separated)</span>
        </label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. design, research, product"
          disabled={pending}
          className="h-9"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save Changes"}
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
