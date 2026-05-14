import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a short URL-safe random code using crypto */
export function shortCode(length = 5): string {
  return randomBytes(length)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length)
}

/** Extract a short readable prefix from a title (max ~12 chars, 2 words) */
export function slugPrefix(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("-")
    .slice(0, 12)
    .replace(/-$/, "")
}

/** Generate a short unique slug: short prefix + random code */
export function generateSlug(title: string): string {
  const prefix = slugPrefix(title)
  const code = shortCode()
  return prefix ? `${prefix}-${code}` : code
}
