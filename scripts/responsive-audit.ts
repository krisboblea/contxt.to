import { chromium } from "playwright"

const VIEWPORTS = [
  { name: "Mobile 375", width: 375, height: 812 },
  { name: "Tablet 768", width: 768, height: 900 },
  { name: "Desktop 1024", width: 1024, height: 768 },
  { name: "Desktop 1440", width: 1440, height: 900 },
]

const PAGES: { path: string; name: string; auth?: boolean; tabs?: string[][] }[] = [
  { path: "/", name: "Landing Page", tabs: [["Browser", "AI Agent", "Developer"]] },
  { path: "/auth/signin", name: "Sign-In Page" },
  { path: "/privacy", name: "Privacy Policy" },
  { path: "/terms", name: "Terms of Service" },
  { path: "/dashboard", name: "Dashboard", auth: true },
  { path: "/dashboard?act=create", name: "Dashboard Create", auth: true },
]

const DOMAIN = "http://localhost:3000"
const OUT = process.env.HOME + "/agents/workspace/helix/shareable/contxt-responsive"
const SESSION_TOKEN = "e2e-session-token-mp9bca4z"

// Scroll entire page to trigger lazy-loaded content (Intersection Observer, lazy images)
async function scrollTrigger(page: any) {
  await page.evaluate(new Function("return new Promise(function(resolve) {" +
    "var step = 300;" +
    "var total = document.body.scrollHeight;" +
    "var y = 0;" +
    "function next() {" +
    "  function scrollUp() {" +
    "    if (y <= 0) { window.scrollTo(0, 0); resolve(); return; }" +
    "    y = Math.max(0, y - step);" +
    "    window.scrollTo(0, y);" +
    "    setTimeout(scrollUp, 40);" +
    "  }" +
    "  if (y >= total) { y = total; scrollUp(); return; }" +
    "  window.scrollTo(0, y);" +
    "  y += step;" +
    "  setTimeout(next, 60);" +
    "}" +
    "next();" +
  "})"))
  await page.waitForTimeout(300)
}

// Click a random tab on pages that have tab groups, to reveal tab-content that's hidden by default
async function clickRandomTabs(page: any, tabGroups: string[][]) {
  for (const labels of tabGroups) {
    // Pick a random tab, biasing away from the first (default) one
    const idx = labels.length > 1 ? 1 + Math.floor(Math.random() * (labels.length - 1)) : 0
    const target = labels[idx]
    const btn = page.locator("button").filter({ hasText: target }).first()
    if (await btn.isVisible().catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(300)
      console.log(`  ↪ Clicked tab "${target}"`)
    }
  }
}

async function main() {
  const browser = await chromium.launch()
  const results: { page: string; viewport: string; overflow: boolean; passed: boolean }[] = []

  for (const pageInfo of PAGES) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await context.newPage()

      // Auth: inject session cookie for protected pages
      if (pageInfo.auth && SESSION_TOKEN) {
        await context.addCookies([{
          name: "authjs.session-token",
          value: SESSION_TOKEN,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          sameSite: "Lax" as const,
        }])
      }

      try {
        await page.goto(DOMAIN + pageInfo.path, { waitUntil: "networkidle", timeout: 15000 })

        // Click random tabs to reveal non-default tab content
        if (pageInfo.tabs) {
          await clickRandomTabs(page, pageInfo.tabs)
        }

        // Scroll trigger lazy content before capture
        await scrollTrigger(page)

        const filename = `${pageInfo.path.replace(/[/?=]/g, "_") || "index"}_${vp.width}w.png`
        await page.screenshot({ path: `${OUT}/${filename}`, fullPage: true })

        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
        )

        results.push({ page: pageInfo.name, viewport: vp.name, overflow, passed: !overflow })
        console.log(`${overflow ? '⚠️' : '✅'} ${pageInfo.name} @ ${vp.name} — overflow: ${overflow}`)
      } catch (e) {
        results.push({ page: pageInfo.name, viewport: vp.name, overflow: false, passed: false })
        console.log(`❌ ${pageInfo.name} @ ${vp.name} — ${(e as Error).message}`)
      }
      await context.close()
    }
  }

  await browser.close()

  // Generate HTML report
  const fn = (path: string, w: number) => `${path.replace(/[/?=]/g, "_") || "index"}_${w}w.png`

  const rows = results.map(r => `
    <tr style="${r.passed ? '' : 'background:#fff0f0'}">
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.page}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.viewport}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.overflow ? '⚠️ Yes' : '✅ No'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.passed ? '✅' : '❌'}</td>
    </tr>`).join("\n")

  const gallery = PAGES.map(p => `
    <div class="page-group">
      <h2>${p.name}</h2>
      <div class="screenshots">
        ${VIEWPORTS.map(vp => `
          <figure>
            <img src="${fn(p.path, vp.width)}" alt="${p.name} @ ${vp.width}px" loading="lazy">
            <figcaption>${vp.name} (${vp.width}×${vp.height})</figcaption>
          </figure>`).join("")}
      </div>
    </div>`).join("\n")

  const { writeFileSync } = await import("fs")
  writeFileSync(`${OUT}/index.html`, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contxt.to Responsive Audit</title>
<style>
  body { font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#f5f5f5; margin:0; padding:24px; }
  h1 { font-size:20px; margin:0 0 4px; }
  .subtitle { color:#666; font-size:13px; margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; background:white; border-radius:8px; overflow:hidden; margin-bottom:32px; }
  th { background:#16163D; color:white; padding:10px 12px; font-size:12px; text-align:left; }
  .gallery { display:flex; flex-direction:column; gap:32px; }
  .page-group { background:white; border-radius:8px; padding:20px; }
  .page-group h2 { font-size:15px; margin:0 0 12px; color:#16163D; }
  .screenshots { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .screenshots figure { margin:0; }
  .screenshots figcaption { font-size:11px; color:#666; margin-top:4px; text-align:center; }
  .screenshots img { width:100%; border:1px solid #eee; border-radius:4px; }
  @media (max-width:800px) { .screenshots { grid-template-columns:repeat(2,1fr); } }
</style>
</head>
<body>
<h1>🎨 Contxt.to Responsive Audit</h1>
<p class="subtitle">${new Date().toISOString().slice(0,19).replace("T"," ")} UTC</p>
<table><thead><tr><th>Page</th><th>Viewport</th><th>Overflow</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
<div class="gallery">${gallery}</div>
</body>
</html>`)

  const total = results.length
  const passed = results.filter(r => r.passed).length
  const overflow = results.filter(r => r.overflow).length
  console.log(`\n📊 ${passed}/${total} passed, ${overflow} with overflow`)
  console.log(`📁 https://max.rediredge.com/helix/contxt-responsive/`)
}

main().catch(console.error)
