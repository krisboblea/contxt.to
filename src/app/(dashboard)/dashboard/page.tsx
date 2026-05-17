import Link from "next/link"
import { getUserContexts } from "@/actions/dashboard-context"
import { ContextList } from "@/components/dashboard/context-list"
import { ContextDetail } from "@/components/dashboard/context-detail"
import { Plus } from "lucide-react"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; q?: string; act?: string }>
}) {
  const { slug, q, act } = await searchParams
  const isCreating = act === "create"
  const isEditing = act === "edit"
  const isViewing = act === "view"
  const hasDetail = Boolean(slug) && (isViewing || isEditing)

  const contexts = await getUserContexts(q)
  const selected = slug ? (contexts.find((c) => c.slug === slug) ?? null) : null
  const editContext = isEditing && slug ? selected : null

  return (
    <div className="flex h-full overflow-hidden">
      {/* List panel */}
      <div className={`${(hasDetail || isCreating) && !isEditing ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] shrink-0 flex-col border-r border-[#F0EDE4] bg-white`}>
        <ContextList contexts={contexts} selectedSlug={slug ?? null} searchQuery={q ?? ""} />
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

      {/* Floating action button — hidden when creating or editing */}
      {!isCreating && !isEditing && (
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
    </div>
  )
}
