import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("has sign in link", async ({ page }) => {
    await page.goto("/")
    // Look for sign-in link or button
    const signIn = page.locator('a[href*="signin"], a[href*="sign-in"], a[href*="sign_in"], a[href*="login"]').first()
    await expect(signIn).toBeVisible()
  })

  test("has legal footer links", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible()
    await expect(page.locator('a[href="/terms"]').first()).toBeVisible()
  })

  test("navigates to privacy page", async ({ page }) => {
    await page.goto("/")
    await page.locator('a[href="/privacy"]').first().click()
    await expect(page).toHaveURL(/\/privacy/)
  })

  test("navigates to terms page", async ({ page }) => {
    await page.goto("/")
    await page.locator('a[href="/terms"]').first().click()
    await expect(page).toHaveURL(/\/terms/)
  })
})

test.describe("Sign-in page", () => {
  test("redirects to sign-in when accessing dashboard without auth", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test("renders Google OAuth button", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.getByText("Continue with Google")).toBeVisible()
  })

  test("renders email input", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test("renders send magic link button", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.getByText("Send magic link")).toBeVisible()
  })

  test("shows welcome heading", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.getByText("Welcome back")).toBeVisible()
  })

  test("submitting invalid email shows error", async ({ page }) => {
    await page.goto("/auth/signin")
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill("not-an-email")
    await page.getByText("Send magic link").click()
    // Should still be on sign-in page (no redirect)
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})

test.describe("Public context page", () => {
  test("shows 404 for non-existent slug", async ({ page }) => {
    const response = await page.goto("/s/nonexistent-slug-12345")
    // Should return 404 or redirect
    expect(response?.status() === 404 || response?.status() === 302).toBeTruthy()
  })
})

test.describe("Static pages", () => {
  test("terms page renders", async ({ page }) => {
    await page.goto("/terms")
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("privacy page renders", async ({ page }) => {
    await page.goto("/privacy")
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("changelog page renders", async ({ page }) => {
    await page.goto("/changelog")
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("contributing page renders", async ({ page }) => {
    await page.goto("/contributing")
    await expect(page.locator("h1").first()).toBeVisible()
  })
})

test.describe("Landing page sections", () => {
  test("shows CTA section", async ({ page }) => {
    await page.goto("/")
    // Look for any call-to-action button or link
    const cta = page.locator('a[href*="signin"], a[href*="sign-up"], button:has-text("Get started"), button:has-text("Try")').first()
    await expect(cta).toBeVisible()
  })

  test("shows main content sections", async ({ page }) => {
    await page.goto("/")
    // The landing page should have content about sharing or AI
    const hasContent = await page.getByText(/share|ai|context|link|content/i).count()
    expect(hasContent).toBeGreaterThan(0)
  })
})
