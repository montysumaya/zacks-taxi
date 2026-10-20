import { expect, test, type Page } from "@playwright/test";

async function choosePlace(page: Page, label: string, query: string, option: RegExp) {
  const input = page.getByRole("combobox", { name: label });
  await input.fill(query);
  await page.getByRole("option", { name: option }).click();
  await expect(page.getByRole("option", { name: option })).toBeHidden();
}

const next = (page: Page) => page.getByRole("button", { name: "Next" }).click();

test.describe("booking flow", () => {
  test("hero → wizard → confirmation → status lifecycle @responsive", async ({ page, isMobile }) => {
    await page.goto("/en");

    // Hero widget hands off to the wizard with the route prefilled.
    await choosePlace(page, "Pickup", "Hamra", /Hamra Street/);
    await choosePlace(page, "Destination", "airport", /Rafic Hariri/);
    await page.getByRole("button", { name: "See fares" }).click();
    await expect(page).toHaveURL(/\/en\/book$/);
    await expect(page.getByRole("heading", { name: "Tell us about your ride" })).toBeVisible();

    // Step 3 validation: a vehicle category is required.
    await next(page);
    await expect(page.getByText("Choose a vehicle category.")).toBeVisible();
    await page.getByText("Comfort", { exact: true }).first().click();
    await next(page);

    // Step 4: fare estimate with breakdown and the illustrative-pricing notice.
    await expect(page.getByRole("heading", { name: "Your fare estimate" })).toBeVisible();
    await expect(page.getByTestId("fare-total")).toContainText("$");
    await expect(page.getByText("Fare breakdown")).toBeVisible();
    await expect(page.getByText("Airport fee")).toBeVisible();
    await expect(page.getByText("Illustrative pricing")).toBeVisible();
    await next(page);

    // Step 5: customer details validation.
    await expect(page.getByRole("heading", { name: "Who's travelling?" })).toBeVisible();
    await next(page);
    await expect(page.getByText("Enter the passenger's full name.")).toBeVisible();
    await expect(page.getByText("Enter a valid Lebanese phone number.")).toBeVisible();
    await page.getByLabel("Full name").fill("Lara Mansour");
    await page.getByLabel("Mobile number").fill("72 000 000");
    await next(page);
    await expect(page.getByText("Enter a valid Lebanese phone number.")).toBeVisible();
    await page.getByLabel("Mobile number").fill("70 123 456");
    await next(page);

    // Step 6: review, terms required, confirm.
    await expect(page.getByRole("heading", { name: "Review and confirm" })).toBeVisible();
    await expect(page.getByText("+961 70 123 456")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByText("Please accept the terms to continue.")).toBeVisible();
    await page.getByRole("checkbox", { name: /I agree to the/ }).check();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(page.getByRole("heading", { name: "Booking request received" })).toBeVisible();
    const reference = (await page.getByTestId("booking-reference").textContent())?.trim();
    expect(reference).toMatch(/^MSR-[A-Z0-9]{5}$/);

    // Step 7: status page with simulated lifecycle.
    await page.getByRole("link", { name: "View booking status" }).click();
    await expect(page).toHaveURL(new RegExp(`/en/bookings/${reference}$`));
    const status = page.getByTestId("booking-status");
    await expect(status).toHaveText("Pending");
    await expect(page.getByText("Status changes here are simulated for demonstration.")).toBeVisible();

    await page.getByRole("button", { name: "Simulate next status: Confirmed" }).click();
    await expect(status).toHaveText("Confirmed");
    await page.getByRole("button", { name: "Simulate next status: Driver assigned" }).click();
    await expect(status).toHaveText("Driver assigned");
    await expect(page.getByText("Demo driver")).toBeVisible();
    await page.getByRole("button", { name: "Simulate next status: Driver en route" }).click();
    await expect(status).toHaveText("Driver en route");

    // The booking survives a reload (mock store persists in this browser).
    await page.reload();
    await expect(status).toHaveText("Driver en route");

    await page.getByRole("button", { name: "Cancel booking" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, cancel" }).click();
    await expect(status).toHaveText("Cancelled");
    await expect(page.getByRole("button", { name: /Simulate next status/ })).toHaveCount(0);

    if (isMobile) await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("full lifecycle reaches Completed", async ({ page }) => {
    await page.goto("/en/book");
    await page.getByText("Book now", { exact: true }).first().click();
    await next(page);
    await page.getByRole("button", { name: "Downtown Beirut" }).click();
    await page.getByRole("button", { name: "Sassine Square" }).click();
    await next(page);
    await page.getByText("Economy", { exact: true }).first().click();
    await next(page);
    await expect(page.getByTestId("fare-total")).toBeVisible();
    await next(page);
    await page.getByLabel("Full name").fill("Omar Itani");
    await page.getByLabel("Mobile number").fill("03 876 543");
    await next(page);
    await page.getByRole("checkbox", { name: /I agree to the/ }).check();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await page.getByRole("link", { name: "View booking status" }).click();

    const status = page.getByTestId("booking-status");
    for (const label of ["Confirmed", "Driver assigned", "Driver en route", "Driver arrived", "In progress", "Completed"]) {
      await page.getByRole("button", { name: `Simulate next status: ${label}` }).click();
      await expect(status).toHaveText(label);
    }
    await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  });

  test("draft persists across reloads and scheduled rides are validated", async ({ page }) => {
    await page.goto("/en/book");
    await page.getByText("Schedule for later", { exact: true }).first().click();
    await next(page);
    await choosePlace(page, "Pickup", "Jounieh", /Jounieh/);
    await choosePlace(page, "Destination", "Byblos", /Byblos/);
    await page.getByLabel("Pickup landmark").fill("Near the marina");
    await next(page);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Tell us about your ride" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByLabel("Pickup landmark")).toHaveValue("Near the marina");
    await next(page);

    await next(page);
    await expect(page.getByText("Choose a date.")).toBeVisible();
    await expect(page.getByText("Choose a time.")).toBeVisible();

    // A time in the past is rejected.
    await page.getByLabel("Date").fill("2020-01-01");
    await page.getByLabel("Time").fill("10:00");
    await page.getByText("Business", { exact: true }).first().click();
    await next(page);
    await expect(page.getByText("Scheduled rides must be at least 30 minutes from now.")).toBeVisible();

    // Start over clears the draft.
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      await page.getByRole("complementary").getByRole("button", { name: "Start over" }).click();
    } else {
      await page.getByRole("button", { name: "Start over" }).click();
    }
    await page.getByRole("dialog").getByRole("button", { name: "Start over" }).click();
    await expect(page.getByRole("heading", { name: "When do you need a ride?" })).toBeVisible();
  });

  test("fleet Book now preselects the category", async ({ page }) => {
    await page.goto("/en/fleet");
    await page.getByRole("link", { name: "Book now — Van" }).click();
    await expect(page).toHaveURL(/\/en\/book\?class=van/);
    await next(page);
    await choosePlace(page, "Pickup", "Tripoli", /Tripoli/);
    await choosePlace(page, "Destination", "Batroun", /Batroun/);
    await next(page);
    await expect(page.getByRole("radio", { name: /Van/ })).toBeChecked();
  });

  test("Arabic booking page renders right-to-left", async ({ page }) => {
    await page.goto("/ar/book");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { name: "متى تحتاج إلى الرحلة؟" })).toBeVisible();
    await page.getByRole("button", { name: "التالي" }).click();
    await expect(page.getByRole("heading", { name: "من أين نقلّك؟" })).toBeVisible();
  });

  test("unknown booking reference shows a not-found state", async ({ page }) => {
    await page.goto("/en/bookings/MSR-NOPE1");
    await expect(page.getByRole("heading", { name: "Booking not found" })).toBeVisible();
  });
});
