import { expect, test, type BrowserContext } from "@playwright/test";

/**
 * Resolves with the decoded text of the next WhatsApp link the page opens.
 * wa.me is stubbed so tests never leave the machine.
 */
async function nextWhatsAppMessage(context: BrowserContext) {
  await context.route("https://wa.me/**", (route) => route.fulfill({ contentType: "text/html", body: "WhatsApp" }));
  const popup = await context.waitForEvent("page");
  await popup.waitForURL(/^https:\/\/wa\.me\//);
  return new URL(popup.url()).searchParams.get("text") ?? "";
}

test.describe("booking request on WhatsApp", () => {
  test("validates, then opens WhatsApp with the trip details and no price @responsive", async ({ page, context }) => {
    await page.goto("/en/book?class=van");
    await page.waitForLoadState("networkidle");
    const form = page.getByRole("main");

    await form.getByRole("button", { name: "Send on WhatsApp" }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Enter the pickup location.")).toBeVisible();
    await expect(form.getByLabel("Full name")).toBeFocused();

    await form.getByLabel("Full name").fill("Lara Mansour");
    await form.getByLabel("Mobile number").fill("70 123 456");
    await form.getByLabel("Trip type").selectOption({ label: "Airport pickup" });
    await expect(form.getByLabel("Pickup")).toHaveValue("Beirut airport");
    await form.getByLabel("Destination").fill("Hamra, Beirut");
    await form.getByLabel("Passengers").selectOption("3");
    await expect(form.getByLabel("Vehicle category")).toHaveValue("van");
    await form.getByLabel("Notes").fill("Flight ME 211, two big suitcases.");

    const message = nextWhatsAppMessage(context);
    await form.getByRole("button", { name: "Send on WhatsApp" }).click();
    const text = await message;

    expect(text).toContain("Hello, I would like to book a ride.");
    expect(text).toContain("Name: Lara Mansour");
    expect(text).toContain("Phone: +961 70 123 456");
    expect(text).toContain("Trip type: Airport pickup");
    expect(text).toContain("Pickup: Beirut airport");
    expect(text).toContain("Destination: Hamra, Beirut");
    expect(text).toContain("Vehicle: Van");
    expect(text).toContain("Flight ME 211");
    expect(text).not.toMatch(/\$|USD|fare:/i);
  });

  test("the Arabic form sends an Arabic message", async ({ page, context }) => {
    await page.goto("/ar");
    await page.waitForLoadState("networkidle");
    const hero = page.locator("[data-booking-widget]");
    await hero.getByLabel("الاسم الكامل").fill("لارا منصور");
    await hero.getByLabel("رقم الهاتف").fill("70123456");
    await hero.getByLabel("مكان الانطلاق").fill("الحمرا");
    await hero.getByLabel("الوجهة").fill("جبيل");

    const message = nextWhatsAppMessage(context);
    await hero.getByRole("button", { name: "إرسال عبر واتساب" }).click();
    const text = await message;
    expect(text).toContain("مرحبًا، أودّ حجز رحلة.");
    expect(text).toContain("الاسم: لارا منصور");
    expect(text).toContain("الوجهة: جبيل");
  });

  test("fleet cards link to the form with the vehicle preselected and show no prices", async ({ page }) => {
    await page.goto("/en/fleet");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/\$\d/)).toHaveCount(0);
    await page.getByRole("link", { name: "Book now — Business" }).click();
    await expect(page).toHaveURL(/\/en\/book\?class=business$/);
    await expect(page.getByRole("main").getByLabel("Vehicle category")).toHaveValue("business");
  });
});
