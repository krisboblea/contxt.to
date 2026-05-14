'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createContext } from '@/actions/context'
import { ResultCard } from './result-card'
import { EmailPrompt } from './email-prompt'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

const contentSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters').max(50000),
})

type ContentForm = z.infer<typeof contentSchema>

export function CreateForm() {
  const [result, setResult] = useState<{
    slug: string
    claimToken: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [generating, setGenerating] = useState(false)

  const form = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      content: '',
    },
  })

  async function onSubmit(data: ContentForm) {
    setPending(true)
    setGenerating(true)
    setError(null)

    try {
      // Step 1: AI generates title + summary
      const metaRes = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
      })

      if (!metaRes.ok) {
        throw new Error('Failed to generate metadata')
      }

      const meta = await metaRes.json()
      setGenerating(false)

      // Step 2: Create context with generated metadata
      const res = await createContext({
        title: meta.title,
        summary: meta.summary,
        content: data.content,
        tags: '',
      })

      if (res.success) {
        setResult({ slug: res.slug, claimToken: res.claimToken })
      } else {
        setError(res.error)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
      setGenerating(false)
    }
  }

  if (result) {
    return (
      <>
        <ResultCard slug={result.slug} />
        <EmailPrompt slug={result.slug} claimToken={result.claimToken} />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Context</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste or write your content here. Supports **markdown**, lists, code blocks, etc."
                    rows={12}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  AI will automatically generate a title and summary.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={pending || generating}>
            {generating
              ? '✨ Generating title & summary...'
              : pending
              ? 'Creating...'
              : '✦ Create Shareable Link'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
