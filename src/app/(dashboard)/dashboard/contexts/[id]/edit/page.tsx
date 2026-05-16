import { notFound } from "next/navigation"
import { getUserContext } from "@/actions/dashboard-context"
import { EditContextForm } from "@/components/dashboard/edit-context-form"

export default async function EditContextPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const context = await getUserContext(id)
  if (!context) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#16163D]">Edit Context</h1>
        <p className="mt-1 text-sm text-[#8B8BA8]">
          Changes will update the public link immediately.
        </p>
      </div>
      <EditContextForm context={context} />
    </div>
  )
}
