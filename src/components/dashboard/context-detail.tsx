"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Copy, Pencil, Trash2, ArrowLeft, Link2, Plus } from "lucide-react"
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
import { NewContextForm } from "./new-context-form"

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
  isCreating: boolean
}

export function ContextDetail({ contexts, initialContext, initialSlug, isCreating }: ContextDetailProps) {
  const router = useRouter()
  const [slug] = useQueryState("slug", parseAsString.withDefault(initialSlug ?? ""))
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Find context from full list using nuqs slug, fall back to initial
  const context = slug ? (contexts.find((c) => c.slug === slug) ?? null) : (initialContext ?? null)

  // Show new context form when in create mode
  if (isCreating) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-[#FCF9F2]">
        <div className="shrink-0 border-b border-[#F0EDE4] bg-white px-4 sm:px-7 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
              style={{ background: "rgba(255,42,109,0.06)" }}
            >
              <Plus size={15} style={{ color: "#FF2A6D" }} />
            </div>
            <div>
              <h2
                className="text-base font-semibold leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#16163D",
                  letterSpacing: "-0.01em",
                }}
              >
                New Context
              </h2>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-7">
          <div
            className="mx-auto max-w-[680px] rounded-xl border border-[#F0EDE4] bg-white p-5 sm:p-6"
            style={{ boxShadow: "0 1px 2px rgba(22,22,61,0.05)" }}
          >
            <NewContextForm />
          </div>
        </div>
      </div>
    )
  }

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

      {/* Header bar — matching mockup: icon + Playfair title + icon-only actions */}
      <div className="shrink-0 border-b border-[#E8E3D8] bg-white px-4 sm:px-7 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={{ background: "rgba(255,42,109,0.06)" }}
            >
              <Link2 size={16} style={{ color: "#FF2A6D" }} />
            </div>
            <div className="min-w-0">
              <h2
                className="text-base sm:text-[17px] font-semibold leading-snug truncate"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#16163D",
                  letterSpacing: "-0.01em",
                }}
              >
                {context.title}
              </h2>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono font-medium no-underline hover:underline"
                style={{ color: "#FF2A6D" }}
              >
                contxt.to/s/{shortLink}
              </a>
            </div>
          </div>
          {/* Icon-only action buttons — matching mockup */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#F0EDE4] bg-white text-[#4A4A6A] hover:bg-[#FCF9F2] hover:border-[#d4cfc0] transition-all"
              title={copied ? "Copied!" : "Copy link"}
            >
              <Copy size={13} />
            </button>
            <Link href={`/dashboard/contexts/${context.id}/edit`}>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#F0EDE4] bg-white text-[#4A4A6A] hover:bg-[#FCF9F2] hover:border-[#d4cfc0] transition-all"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            </Link>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#F0EDE4] bg-white text-[#ef4444] hover:bg-[#FCF9F2] hover:border-[#fca5a5] transition-all"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable body with card wrapper — matching mockup */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-7">
        <div
          className="mx-auto max-w-[680px] rounded-xl border border-[#F0EDE4] bg-white p-5 sm:p-6"
          style={{ boxShadow: "0 1px 2px rgba(22,22,61,0.05)" }}
        >
          {/* Stats row */}
          <div className="flex items-center gap-6 sm:gap-8 pb-5 mb-5 border-b border-[#E8E3D8]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8B8BA8]">
                Created
              </p>
              <p
                className="text-lg sm:text-xl font-bold leading-tight mt-0.5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#16163D",
                  letterSpacing: "-0.01em",
                }}
              >
                {relativeTime(context.createdAt)}
              </p>
              <p className="text-[11px] text-[#4A4A6A] mt-0.5">{fullDate(context.createdAt)}</p>
            </div>
            <div className="w-px self-stretch bg-[#E8E3D8]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8B8BA8]">
                Updated
              </p>
              <p
                className="text-lg sm:text-xl font-bold leading-tight mt-0.5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#16163D",
                  letterSpacing: "-0.01em",
                }}
              >
                {relativeTime(context.updatedAt)}
              </p>
              <p className="text-[11px] text-[#4A4A6A] mt-0.5">{fullDate(context.updatedAt)}</p>
            </div>
          </div>

          {/* Summary */}
          {context.summary && (
            <div className="text-sm leading-relaxed text-[#4A4A6A] mb-5 pb-5 border-b border-[#E8E3D8]">
              {context.summary}
            </div>
          )}

          {/* Markdown content */}
          <div className="text-sm leading-relaxed text-[#16163D]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
            >
              {context.content}
            </ReactMarkdown>
          </div>
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
