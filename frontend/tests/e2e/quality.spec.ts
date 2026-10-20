import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const publicPages = ["", "/services", "/fleet", "/airport-transfers", "/about", "/contact", "/faq", "/privacy", "/terms", "/book", "/design-system"];
const adminPages = ["", "/bookings", "/dispatch", "/drivers", "/vehicles", "/customers", "/pricing", "/payments", "/reports", "/staff", "/notifications", "/settings"];

/** Fail on any console error or uncaught exception (hydration mismatches included). */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

/** Wait until client-loaded admin data has replaced the skeletons. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  // Mock data arrives via timers, not the network: wait for every skeleton to go.
  await expect(page.locator(".ui-skeleton")).toHaveCount(0, { timeout: 15_000 });
}

test.describe("quality sweep @responsive", () => {
  for (const locale of ["en", "ar"] as const) {
    for (const path of publicPages) {
      test(`no console errors or overflow: /${locale}${path}`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.goto(`/${locale}${path}`);
        await page.waitForLoadState("networkidle");
        expect(errors, errors.join("\n")).toEqual([]);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        // No horizontal scrolling at any viewport.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
    for (const path of adminPages) {
      test(`admin renders cleanly: /${locale}/admin${path}`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.goto(`/${locale}/admin${path}`);
        await settle(page);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(errors, errors.join("\n")).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  }
});

test.describe("links @desktop-only", () => {
  test("every internal link on public pages resolves", async ({ page, request }) => {
    const hrefs = new Set<string>();
    for (const locale of ["en", "ar"]) {
      for (const path of publicPages) {
        await page.goto(`/${locale}${path}`);
        const found = await page.$$eval("a[href^='/']", (links) => links.map((a) => a.getAttribute("href")!));
        found.forEach((h) => hrefs.add(h.split("#")[0]));
      }
    }
    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, broken.join("\n")).toEqual([]);
    expect(hrefs.size).toBeGreaterThan(20);
  });
});

test.describe("accessibility (axe) @desktop-only", () => {
  const targets = [
    "/en",
    "/ar",
    "/en/book",
    "/en/contact",
    "/en/fleet",
    "/en/airport-transfers",
    "/en/faq",
    "/en/admin",
    "/en/admin/bookings",
    "/en/admin/dispatch",
    "/en/admin/pricing",
    "/en/admin/staff",
    "/ar/admin/bookings",
  ];
  for (const url of targets) {
    test(`no serious or critical violations: ${url}`, async ({ page }) => {
      await page.goto(url);
      if (url.includes("/admin")) await settle(page);
      else await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("\n  ")}`),
      ).toEqual([]);
    });
  }
});
