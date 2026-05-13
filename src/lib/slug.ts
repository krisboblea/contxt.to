export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function randomSuffix(length = 4): string {
  return Math.random().toString(36).slice(2, 2 + length)
}

export function generateSlug(title: string): string {
  return `${slugify(title)}-${randomSuffix()}`
}
