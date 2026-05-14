'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContext } from '@/actions/context'
import { createContextSchema as contextSchema, type CreateContextForm as ContextFormData } from '@/lib/schemas'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function CreateForm() {
  const [result, setResult] = useState<{
    slug: string
    claimToken: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const form = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      tags: '',
    },
  })

  async function onSubmit(data: ContextFormData) {
    setPending(true)
    setError(null)
    try {
      const res = await createContext(data)
      if (res.success) {
        setResult({ slug: res.slug, claimToken: res.claimToken })
      } else {
        setError(res.error)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Q1 Market Analysis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief overview of what this context covers..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Full context content. Supports **markdown**, lists, code blocks, etc."
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="analysis, marketing, 2026"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? 'Creating...' : '✦ Create Shareable Link'}
        </Button>
      </form>
    </Form>
  )
}
