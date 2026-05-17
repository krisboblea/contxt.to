"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserContexts, bulkDeleteContexts } from "@/actions/dashboard-context"
import { ContextList } from "@/components/dashboard/context-list"
import { ContextDetail } from "@/components/dashboard/context-detail"
import { Plus, Trash2 } from "lucide-react"
import { useQueryState } from "nuqs"
import { parseAsString } from "nuqs"
import { toast } from "sonner"
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

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; q?: string; act?: string }>
}) {
  const router = useRouter()
  const [contexts, setContexts] = useState<DashboardContext[]>([])
  const [loading, setLoading] = useState(true)

  // Resolve searchParams
  const [resolvedParams, setResolvedParams] = useState<{ slug?: string; q?: string; act?: string }>({})
  useEffect(() => {
    searchParams.then(setResolvedParams).finally(() => setLoading(false))
  }, [searchParams])

  const { slug, q, act } = resolvedParams
  const isCreating = act === "create"
  const isEditing = act === "edit"
  const isViewing = act === "view"
  const hasDetail = Boolean(slug) && (isViewing || isEditing)

  // Load contexts
  useEffect(() => {
    getUserContexts(q).then(setContexts)
  }, [q])

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Clear selection when search changes
  useEffect(() => {
    setSelectedIds(new Set())
  }, [q])

  const selected = slug ? (contexts.find((c) => c.slug === slug) ?? null) : null
  const editContext = isEditing && slug ? selected : null

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      const result = await bulkDeleteContexts(Array.from(selectedIds))
      toast.success(`${result.deleted} context${result.deleted !== 1 ? "s" : ""} deleted`)
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      setContexts((prev) => prev.filter((c) => !selectedIds.has(c.id)))
      router.refresh()
    } catch {
      toast.error("Failed to delete contexts")
      setBulkDeleting(false)
    }
  }, [selectedIds, router])

  if (loading) return null

  return (
    <div className="flex h-full overflow-hidden">
      {/* List panel */}
      <div className={`${hasDetail && !isEditing && !isCreating ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] shrink-0 flex-col border-r border-[#F0EDE4] bg-white`}>
        <ContextList
          contexts={contexts}
          selectedSlug={slug ?? null}
          searchQuery={q ?? ""}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      {/* Detail / Create / Edit panel */}
      <div className={`${!hasDetail && !isCreating ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-[#FCF9F2]`}>
        <ContextDetail
          contexts={contexts}
          initialContext={selected}
          initialSlug={slug ?? null}
          isCreating={isCreating}
          editContext={editContext}
        />
      </div>

      {/* Batch action bar — full viewport width */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 20px",
            background: "#16163D",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 500,
            zIndex: 50,
          }}
        >
          <span><span id="batchCount">{selectedIds.size}</span> selected</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="cursor-pointer"
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.2)"
                e.currentTarget.style.borderColor = "#ef4444"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
              }}
            >
              <Trash2 size={11} />
              Delete selected
            </button>
          </div>
        </div>
      )}

      {/* FAB — hidden when batch bar is visible */}
      {!isCreating && !isEditing && selectedIds.size === 0 && (
        <Link
          href="/dashboard?act=create"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: '#FF2A6D',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(255, 42, 109, 0.35)',
          }}
          aria-label="New context"
        >
          <Plus size={24} />
        </Link>
      )}

      {/* Bulk delete confirmation dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={(open) => setBulkDeleteOpen(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} context{selectedIds.size !== 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              {selectedIds.size} context{selectedIds.size !== 1 ? "s" : ""} will be permanently deleted and their
              public links will stop working. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Deleting…" : `Delete ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
