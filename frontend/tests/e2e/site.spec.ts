import { expect, test } from "@playwright/test";

const pages = ["/", "/services", "/fleet", "/airport-transfers", "/about", "/contact", "/faq", "/privacy", "/terms", "/book"];

test.describe("public website", () => {
  for (const locale of ["en", "ar"] as const) {
    for (const path of pages) {
      test(`${locale}${path} renders @responsive`, async ({ page }) => {
        const response = await page.goto(`/${locale}${path === "/" ? "" : path}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page).toHaveTitle(/Zacks|زاكس/);
      });
    }
  }

  test("root redirects to the preferred locale", async ({ browser }) => {
    // The browser locale drives Accept-Language.
    const context = await browser.newContext({ locale: "ar-LB" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await context.close();
  });

  test("unknown pages return the localized 404", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  });

  test("contact form validates and opens WhatsApp with the message", async ({ page, context }) => {
    await page.goto("/en/contact");
    const main = page.getByRole("main");
    await main.getByRole("button", { name: "Send on WhatsApp" }).click();
    await expect(page.getByText("Enter your name.")).toBeVisible();
    await main.getByLabel("Full name").fill("Lara Mansour");
    await main.getByRole("textbox", { name: "Message", exact: true }).fill("Regular airport transfers for our team, please.");
    await context.route("https://wa.me/**", (route) => route.fulfill({ contentType: "text/html", body: "WhatsApp" }));
    const popup = context.waitForEvent("page");
    await main.getByRole("button", { name: "Send on WhatsApp" }).click();
    const opened = await popup;
    await opened.waitForURL(/^https:\/\/wa\.me\//);
    const url = decodeURIComponent(opened.url());
    expect(url).toContain("Lara Mansour");
    expect(url).toContain("Regular airport transfers");
  });

  test("contact page shows the business details", async ({ page }) => {
    await page.goto("/en/contact");
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "+961 70 062 162" }).first()).toHaveAttribute("href", "tel:+96170062162");
    await expect(main.getByRole("link", { name: "info@zacks.taxi" })).toBeVisible();
    await expect(main.getByText("Damascus Main Road, Aley, Lebanon")).toBeVisible();
  });
});
