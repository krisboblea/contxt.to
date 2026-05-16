import { getUserContexts } from "@/actions/dashboard-context"
import { ContextList } from "@/components/dashboard/context-list"
import { ContextDetail } from "@/components/dashboard/context-detail"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  const contexts = await getUserContexts()
  const selected = slug ? (contexts.find((c) => c.slug === slug) ?? null) : null

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] overflow-hidden">
      <ContextList contexts={contexts} selectedSlug={slug ?? null} />
      <ContextDetail context={selected} />
    </div>
  )
}
