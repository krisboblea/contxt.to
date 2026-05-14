import { describe, test, expect } from "vitest"
import { cn, generateSlug, shortCode, slugPrefix } from "@/lib/utils"

describe("cn", () => {
  test("merges class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  test("handles conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c")
  })

  test("deduplicates tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})

describe("shortCode", () => {
  test("returns a 5-char string by default", () => {
    const s = shortCode()
    expect(s).toHaveLength(5)
  })

  test("respects custom length", () => {
    expect(shortCode(3)).toHaveLength(3)
    expect(shortCode(8)).toHaveLength(8)
  })

  test("returns alphanumeric characters only", () => {
    const s = shortCode(10)
    expect(s).toMatch(/^[a-zA-Z0-9]+$/)
  })
})

describe("slugPrefix", () => {
  test("takes first two words, lowercased", () => {
    expect(slugPrefix("Bug Fix Done")).toBe("bug-fix")
  })

  test("removes special chars", () => {
    expect(slugPrefix("Hello! World# Test")).toBe("hello-world")
  })

  test("caps at 12 chars", () => {
    expect(slugPrefix("A very long title here").length).toBeLessThanOrEqual(12)
  })

  test("returns empty string for empty input", () => {
    expect(slugPrefix("")).toBe("")
  })
})

describe("generateSlug", () => {
  test("includes prefix and a 5-char random code", () => {
    const slug = generateSlug("My Project")
    expect(slug).toMatch(/^my-project-[a-zA-Z0-9]{5}$/)
  })

  test("falls back to just code for empty title", () => {
    const slug = generateSlug("")
    expect(slug).toMatch(/^[a-zA-Z0-9]{5}$/)
  })

  test("produces different slugs for the same input", () => {
    const attempts = Array.from({ length: 20 }, () => generateSlug("test"))
    const unique = new Set(attempts).size
    expect(unique).toBeGreaterThan(1)
  })
})
