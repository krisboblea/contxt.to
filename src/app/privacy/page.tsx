import { LegalPage } from "@/components/legal/page-layout"
import { content } from "./content"

export const metadata = {
  title: "Privacy Policy — contxt.to",
  description: "How contxt.to handles your data — we keep it simple and transparent.",
  openGraph: {
    title: "Privacy Policy — contxt.to",
    description: "How contxt.to handles your data — we keep it simple and transparent.",
  },
}

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" content={content} />
}
