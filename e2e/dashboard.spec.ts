import { test, expect, type Page } from "@playwright/test"

const SESSION_TOKEN =
  process.env.E2E_SESSION_TOKEN || "e2e-session-token-mp9a4qg8"

async function login(page: Page) {
  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: SESSION_TOKEN,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax" as const,
    },
  ])
}

test.describe("Dashboard — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test("loads dashboard with contexts list", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)
    // Logo visible
    await expect(page.getByText("Contxt")).toBeVisible()
    // No contexts state (empty DB) — should show empty state
    await expect(page.getByText("No contexts yet")).toBeVisible()
  })

  test("opens create form via FAB", async ({ page }) => {
    await page.goto("/dashboard")
    // FAB is the last a[aria-label="New context"] (fixed bottom-right)
    const fab = page.locator('a[aria-label="New context"]').last()
    await fab.click()
    await expect(page).toHaveURL(/\/dashboard\?act=create/)
    // Should show "New Context" heading
    await expect(page.getByRole("heading", { name: "New Context" })).toBeVisible()
    // Left panel should still be visible
    await expect(page.getByText("No contexts yet")).toBeVisible()
  })

  test("opens create form via + button in list header", async ({ page }) => {
    await page.goto("/dashboard")
    // The "+" button is the first a[aria-label="New context"] (header)
    const plusBtn = page.locator('a[aria-label="New context"]').first()
    await plusBtn.click()
    await expect(page).toHaveURL(/\/dashboard\?act=create/)
    await expect(page.getByRole("heading", { name: "New Context" })).toBeVisible()
  })

  test("create form has textarea and submit button", async ({ page }) => {
    await page.goto("/dashboard?act=create")
    await page.waitForLoadState("networkidle")
    // Textarea should be visible
    const textarea = page.locator("textarea").first()
    await expect(textarea).toBeVisible()
    await expect(textarea).toBeEnabled()
    // Submit button
    await expect(page.getByText("✦ Create Context")).toBeVisible()
    // Cancel button
    await expect(page.getByText("Cancel")).toBeVisible()
  })

  test("create form validates minimum content", async ({ page }) => {
    await page.goto("/dashboard?act=create")
    await page.waitForLoadState("networkidle")
    // Submit with too-short content
    const textarea = page.locator("textarea").first()
    await textarea.fill("short")
    await page.getByText("✦ Create Context").click()
    // Should show error
    await expect(page.getByText("at least 10 characters")).toBeVisible()
  })

  test("create form cancel returns to dashboard", async ({ page }) => {
    await page.goto("/dashboard?act=create")
    await page.waitForLoadState("networkidle")
    await page.getByText("Cancel").click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("dashboard shows header with user initials", async ({ page }) => {
    await page.goto("/dashboard")
    // User avatar should show initials ("E2E Test User" → "ET")
    const avatar = page.locator('button[aria-label="User menu"]')
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveText("ET")
  })

  test("user menu opens and shows email", async ({ page }) => {
    await page.goto("/dashboard")
    // Click user avatar
    const avatar = page.locator('button[aria-label="User menu"]')
    await avatar.click()
    // Should show user email in dropdown
    await expect(page.getByText("e2e@contxt.test")).toBeVisible()
    // Should have Sign out
    await expect(page.getByText("Sign out")).toBeVisible()
  })

  test("notifications icon is hidden", async ({ page }) => {
    await page.goto("/dashboard")
    // Notification bell should not be visible
    const notif = page.locator('button[aria-label="Notifications"]')
    await expect(notif).not.toBeVisible()
  })

  test("mobile nav sheet opens", async ({ page }) => {
    // Use a mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    // Hamburger menu should be visible on mobile
    const hamburger = page.locator('button[aria-label="Open navigation menu"]')
    await expect(hamburger).toBeVisible()
    // Click it
    await hamburger.click()
    // Wait for sheet animation
    await page.waitForTimeout(500)
    // Sheet should show navigation items
    await expect(page.getByRole("link", { name: "Contexts" }).first()).toBeVisible()
  })
})

test.describe("Dashboard — public pages still accessible", () => {
  test("landing page doesn't redirect when no auth", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")
  })

  test("dashboard redirects to sign-in without auth", async ({ page }) => {
    // Don't call login() — this test is unauthenticated
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})
