/**
 * Simple in-memory rate limiter for API routes.
 *
 * Note: On Vercel serverless, each cold start has its own counter.
 * This is a best-effort rate limit, not a hard security boundary.
 * For production, replace with Vercel KV or database-backed rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, 60_000).unref()

export interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  max: number
  /** Window duration in seconds */
  windowSeconds: number
}

const DEFAULTS: RateLimitConfig = {
  max: 30,
  windowSeconds: 60,
}

/**
 * Extracts a rate-limit key from a request.
 * Prefers x-forwarded-for, falls back to x-real-ip, then a placeholder.
 */
function getKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim()
    if (ip) return ip
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  // Fallback: use a static key so all unidentifiable requests share one bucket
  return "unknown"
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Check if a request should be rate-limited.
 * Returns the current state so the caller can set response headers.
 */
export function checkRateLimit(
  request: Request,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { max, windowSeconds } = { ...DEFAULTS, ...config }
  const key = getKey(request)
  const now = Date.now()

  let entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    entry = { count: 1, resetAt: now + windowSeconds * 1000 }
    store.set(key, entry)
    return { allowed: true, remaining: max - 1, resetAt: entry.resetAt, limit: max }
  }

  entry.count++

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: max }
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt, limit: max }
}

/**
 * Apply rate limit headers to a Response and return 429 if exceeded.
 * Returns the original response if allowed, or a 429 Response if rate-limited.
 */
export function withRateLimit(
  request: Request,
  response: Response | null,
  config: Partial<RateLimitConfig> = {}
): Response {
  const result = checkRateLimit(request, config)
  const headers = new Headers(response?.headers ?? {})

  headers.set("X-RateLimit-Limit", String(result.limit))
  headers.set("X-RateLimit-Remaining", String(result.remaining))
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)))

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again shortly." }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "Content-Type": "application/json",
        },
      }
    )
  }

  if (response) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return new Response(null, { status: 204, headers })
}
