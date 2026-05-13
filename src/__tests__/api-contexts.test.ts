import { describe, test, expect, vi, beforeEach } from "vitest"

const { mockFindUnique, mockCreate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    context: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}))

import { POST } from "@/app/api/contexts/route"
import { NextRequest } from "next/server"

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/contexts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindUnique.mockResolvedValue(null)
  mockCreate.mockResolvedValue({
    id: "test-id",
    title: "Test Title",
    slug: "test-title-abcd",
    summary: "A test summary that is long enough",
    content: "Test content that is long enough",
    tags: JSON.stringify(["test"]),
    claimToken: "deadbeef",
    creatorIp: null,
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
})

describe("POST /api/contexts", () => {
  test("returns 200 with slug and url on valid input", async () => {
    const req = makeRequest({
      title: "Test Title",
      summary: "A test summary that is long enough",
      content: "Test content that is long enough to pass validation",
    })
    const res = await POST(req)
    const json = await res.json()
    expect(json).toHaveProperty("slug")
    expect(json).toHaveProperty("url")
    expect(json.url).toContain("contxt.to/s/")
  })

  test("returns 400 on missing title", async () => {
    const req = makeRequest({
      summary: "A test summary that is long enough",
      content: "Test content that is long enough",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  test("returns 400 on invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/contexts", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  test("returns 400 when summary is too short", async () => {
    const req = makeRequest({
      title: "Test",
      summary: "short",
      content: "Test content that is long enough",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
