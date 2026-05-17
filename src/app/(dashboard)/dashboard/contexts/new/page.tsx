import { NewContextForm } from "@/components/dashboard/new-context-form"

export default function NewContextPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#16163D]">New Context</h1>
        <p className="mt-1 text-sm text-[#8B8BA8]">
          Paste your content and we&apos;ll generate a shareable link.
        </p>
      </div>
      <NewContextForm />
    </div>
  )
}
