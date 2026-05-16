"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Copy, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { useQueryState } from "nuqs"
import { parseAsString } from "nuqs"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize from "rehype-sanitize"
import { deleteContext } from "@/actions/dashboard-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface ContextDetailProps {
  contexts: DashboardContext[]
  initialContext: DashboardContext | null
  initialSlug: string | null
}

export function ContextDetail({ contexts, initialContext, initialSlug }: ContextDetailProps) {
  const router = useRouter()
  const [slug] = useQueryState("slug", parseAsString.withDefault(initialSlug ?? ""))
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Find context from full list using nuqs slug, fall back to initial
  const context = slug ? (contexts.find((c) => c.slug === slug) ?? null) : (initialContext ?? null)

  if (!context) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[#8B8BA8]">
          {slug ? "Loading…" : "Select a context to preview"}
        </p>
      </div>
    )
  }

  const shortLink = `${context.slug}`
  const fullUrl = `https://contxt.to/s/${context.slug}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = fullUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!context) return
    setDeleting(true)
    try {
      await deleteContext(context.id)
      toast.success("Context deleted")
      setDeleteOpen(false)
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Failed to delete context")
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#FCF9F2]">
      {/* Mobile back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="md:hidden flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#4A4A6A] hover:text-[#FF2A6D] transition-colors border-b border-[#F0EDE4] bg-white"
      >
        <ArrowLeft size={14} />
        Back to contexts
      </button>

      {/* Header bar */}
      <div className="shrink-0 border-b border-[#F0EDE4] bg-white p-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="min-w-0 flex-1 text-base font-semibold text-[#16163D] leading-snug">
            {context.title}
          </h2>
          <div className="flex flex-col sm:flex-row shrink-0 items-stretch sm:items-center gap-1.5 sm:gap-2">
            <Link href={`/dashboard/contexts/${context.id}/edit`}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1 text-xs">
                <Pencil size={11} />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto gap-1 text-xs"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={11} />
              Delete
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate text-[11px] font-mono text-[#8B8BA8]">contxt.to/s/{shortLink}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1 text-xs font-medium text-[#FF2A6D] hover:opacity-70 transition-opacity"
          >
            <Copy size={11} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="shrink-0 border-b border-[#F0EDE4] bg-white px-4 py-2.5">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8BA8]">Created</p>
            <p className="text-sm font-semibold text-[#16163D]">{relativeTime(context.createdAt)}</p>
            <p className="text-[10px] text-[#8B8BA8]">{fullDate(context.createdAt)}</p>
          </div>
          <div className="w-px self-stretch bg-[#F0EDE4]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8BA8]">Updated</p>
            <p className="text-sm font-semibold text-[#16163D]">{relativeTime(context.updatedAt)}</p>
            <p className="text-[10px] text-[#8B8BA8]">{fullDate(context.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Markdown content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="prose prose-sm max-w-none text-[#16163D]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          >
            {context.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => setDeleteOpen(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete context?</DialogTitle>
            <DialogDescription>
              &ldquo;{context.title}&rdquo; will be permanently deleted and its
              public link will stop working. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
