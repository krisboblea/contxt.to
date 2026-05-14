'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { QrCode } from '@/components/shared/qr-code'
import { AiButtons } from '@/components/shared/ai-buttons'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function ResultCard({ slug }: { slug: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://contxt.to"
  const url = `${origin}/s/${slug}`
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Your link is ready ✦</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* URL + copy */}
        <div className="flex items-center gap-2">
          <Input value={url} readOnly className="font-mono text-sm" />
          <Button
            variant="outline"
            size="icon"
            onClick={copyUrl}
            title="Copy URL"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* QR code */}
        <div className="flex justify-center">
          <QrCode url={url} />
        </div>

        {/* AI buttons */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Share this link — recipients can continue in any AI:
          </p>
          <AiButtons slug={slug} />
        </div>
      </CardContent>
    </Card>
  )
}
