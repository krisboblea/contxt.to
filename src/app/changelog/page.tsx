import { LegalPage } from "@/components/legal/page-layout"
import { content } from "./content"

export const metadata = {
  title: "Changelog — contxt.to",
  description: "What's new in contxt.to — product updates, features, and fixes.",
  openGraph: {
    title: "Changelog — contxt.to",
    description: "What's new in contxt.to — product updates, features, and fixes.",
  },
}

export default function ChangelogPage() {
  return <LegalPage title="Changelog" content={content} />
}
