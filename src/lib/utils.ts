import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function randomSuffix(length = 4): string {
  return Math.random().toString(36).slice(2, 2 + length)
}

export function generateSlug(title: string): string {
  return `${slugify(title)}-${randomSuffix()}`
}
