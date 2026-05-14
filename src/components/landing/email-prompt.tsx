'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface EmailPromptProps {
  slug: string
  claimToken: string | null
}

export function EmailPrompt({ slug, claimToken }: EmailPromptProps) {
  const [dismissed, setDismissed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)

  if (dismissed || submitted) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setPending(true)
    try {
      await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token: claimToken, email }),
      })
      setSubmitted(true)
    } catch {
      // Silently fail — link still works
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Want to manage this link?</CardTitle>
          <CardDescription>
            Enter your email to save it to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? 'Saving...' : 'Save & Manage'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
              >
                No thanks
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
