import { LegalPage } from "@/components/legal/page-layout"
import { content } from "./content"

export const metadata = {
  title: "Contributing — contxt.to",
  description: "How to contribute to contxt.to — setup, workflow, and conventions.",
  openGraph: {
    title: "Contributing — contxt.to",
    description: "How to contribute to contxt.to — setup, workflow, and conventions.",
  },
}

export default function ContributingPage() {
  return <LegalPage title="Contributing" content={content} />
}
