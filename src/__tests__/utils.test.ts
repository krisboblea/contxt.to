import { describe, test, expect } from "vitest"
import { cn, slugify, generateSlug, randomSuffix } from "@/lib/utils"

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

describe("slugify", () => {
  test("lowercases and replaces spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  test("removes special characters", () => {
    expect(slugify("Hello! @World#")).toBe("hello-world")
  })

  test("trims leading/trailing hyphens", () => {
    expect(slugify("  --hello--  ")).toBe("hello")
  })

  test("truncates to 60 characters", () => {
    const long = "a".repeat(100)
    expect(slugify(long).length).toBeLessThanOrEqual(60)
  })

  test("collapses multiple hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world")
  })
})

describe("randomSuffix", () => {
  test("returns a 4-char string by default", () => {
    const s = randomSuffix()
    expect(s).toHaveLength(4)
  })

  test("returns alphanumeric characters only", () => {
    const s = randomSuffix(8)
    expect(s).toMatch(/^[a-z0-9]+$/)
  })
})

describe("generateSlug", () => {
  test("includes slugified title and a suffix", () => {
    const slug = generateSlug("My Project")
    expect(slug).toMatch(/^my-project-[a-z0-9]{4}$/)
  })

  test("produces different slugs for the same input", () => {
    const a = generateSlug("test")
    const b = generateSlug("test")
    // Statistically overwhelmingly likely to differ
    const attempts = Array.from({ length: 10 }, () => generateSlug("test"))
    const unique = new Set(attempts).size
    expect(unique).toBeGreaterThan(1)
  })
})
