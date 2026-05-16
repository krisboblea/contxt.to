import { getUserContexts } from "@/actions/dashboard-context"
import { ContextList } from "@/components/dashboard/context-list"
import { ContextDetail } from "@/components/dashboard/context-detail"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; q?: string }>
}) {
  const { slug, q } = await searchParams
  const contexts = await getUserContexts(q)
  const selected = slug ? (contexts.find((c) => c.slug === slug) ?? null) : null

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] overflow-hidden">
      {/* Mobile: show list when no slug, detail when slug */}
      <div className={`${slug ? 'hidden md:flex' : 'flex'} w-full md:w-[300px] shrink-0 flex-col border-r border-[#F0EDE4] bg-white`}>
        <ContextList contexts={contexts} selectedSlug={slug ?? null} searchQuery={q ?? ""} />
      </div>
      {/* Desktop: always show detail panel. Mobile: only show when slug selected */}
      <div className={`${!slug ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-[#FCF9F2]`}>
        <ContextDetail context={selected} slugParam={slug ?? null} />
      </div>
    </div>
  )
}
