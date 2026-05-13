import { z } from 'zod'

export const createContextSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500),
  content: z.string().min(10, 'Content must be at least 10 characters').max(50000),
  tags: z.string().max(200).optional(),
})

export type CreateContextForm = z.infer<typeof createContextSchema>

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}
