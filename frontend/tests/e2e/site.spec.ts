import { expect, test } from "@playwright/test";

const pages = ["/", "/services", "/fleet", "/airport-transfers", "/about", "/contact", "/faq", "/privacy", "/terms", "/book", "/design-system"];

test.describe("public website", () => {
  for (const locale of ["en", "ar"] as const) {
    for (const path of pages) {
      test(`${locale}${path} renders @responsive`, async ({ page }) => {
        const response = await page.goto(`/${locale}${path === "/" ? "" : path}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page).toHaveTitle(/Masar|مسار/);
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

  test("contact form validates and submits to the mock service", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Enter your name.")).toBeVisible();
    await page.getByLabel("Full name").fill("Lara Mansour");
    await page.getByLabel("Email").fill("lara@example.com");
    await page.getByRole("textbox", { name: "Message", exact: true }).fill("I'd like to arrange regular airport transfers for our team.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent")).toBeVisible();
  });

  test("placeholder contact details are labelled", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("main").getByText("Placeholder").first()).toBeVisible();
    await expect(page.getByText("These contact details are placeholders")).toBeVisible();
  });
});
