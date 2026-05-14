import { LegalPage } from "@/components/legal/page-layout"
import { content } from "./content"

export const metadata = {
  title: "Terms of Service — contxt.to",
  description: "The rules of the road for using contxt.to — fair, transparent, and minimal.",
  openGraph: {
    title: "Terms of Service — contxt.to",
    description: "The rules of the road for using contxt.to — fair, transparent, and minimal.",
  },
}

export default function TermsPage() {
  return <LegalPage title="Terms of Service" content={content} />
}
