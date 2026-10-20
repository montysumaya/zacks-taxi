import { expect, test, type Page } from "@playwright/test";

async function settle(page: Page) {
  await expect(page.locator(".ui-skeleton")).toHaveCount(0, { timeout: 15_000 });
}

async function switchRole(page: Page, role: string) {
  await page.getByRole("button", { name: "Profile menu" }).click();
  await page.getByRole("radio", { name: role }).check();
}

test.describe("admin dashboard prototype", () => {
  test("is clearly marked as a frontend prototype and shows today's KPIs @responsive", async ({ page }) => {
    await page.goto("/en/admin");
    await expect(page.getByText(/Frontend prototype · fictional mock data/)).toBeVisible();
    await settle(page);
    for (const label of ["Today's bookings", "Pending bookings", "Active trips", "Completed today", "Available drivers", "Busy drivers", "Cancelled today", "Today's revenue"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Bookings, last 14 days" })).toBeVisible();
    await expect(page.getByText("View as table").first()).toBeVisible();
  });

  test("bookings table: topbar search, filters, sorting and pagination @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/bookings");
    await settle(page);
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
    const total = Number((await page.getByText(/^\d+–\d+ of \d+$/).textContent())!.split(" of ")[1]);
    expect(total).toBeGreaterThan(15);

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();

    await page.getByRole("combobox", { name: "Status" }).selectOption("cancelled");
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
    const statuses = page.locator("tbody tr td:last-child");
    await expect(statuses.first()).toHaveText("Cancelled");
    expect(new Set(await statuses.allTextContents())).toEqual(new Set(["Cancelled"]));

    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByRole("button", { name: "Sort by Fare" }).click();
    await page.getByRole("button", { name: "Sort by Fare" }).click(); // descending
    const fares = (await page.locator("tbody tr td:nth-last-child(2)").allTextContents()).map((s) => Number(s.replace(/[^0-9.]/g, "")));
    expect(fares).toEqual([...fares].sort((a, b) => b - a));

    // Global search from the topbar.
    await page.getByRole("searchbox", { name: "Search" }).first().fill("MSR-7K2Q9");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=MSR-7K2Q9/);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.locator("tbody tr").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("MSR-7K2Q9");
  });

  test("create a phone booking, assign a driver, run the trip and see the timeline", async ({ page }) => {
    await page.goto("/en/admin/bookings");
    await settle(page);
    await page.getByRole("button", { name: "New booking" }).click();
    const dialog = page.getByRole("dialog", { name: "New booking" });
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog.getByText("This field is required.").first()).toBeVisible();
    await expect(dialog.getByText("Enter a valid Lebanese phone number.")).toBeVisible();

    await dialog.getByLabel("Customer name").fill("Test Customer");
    await dialog.getByLabel("Customer phone").fill("70 111 222");
    await dialog.getByLabel("Pickup").selectOption({ label: "Hamra Street" });
    await dialog.getByLabel("Destination").selectOption({ label: "Hamra Street" });
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog.getByText("Pickup and destination must be different.")).toBeVisible();
    await dialog.getByLabel("Destination").selectOption({ label: "Byblos" });
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/en\/admin\/bookings\/bkg_/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("Confirmed");

    await page.getByRole("button", { name: "Assign driver" }).click();
    const assign = page.getByRole("dialog", { name: /Assign a driver/ });
    await expect(assign.getByText("Best match")).toBeVisible();
    await assign.getByRole("button", { name: "Assign" }).click();
    await expect(heading).toContainText("Driver assigned");

    for (const status of ["Driver en route", "Driver arrived", "In progress", "Completed"]) {
      await page.getByRole("button", { name: `Mark as “${status}”` }).click();
      await expect(heading).toContainText(status);
    }
    const timeline = page.getByRole("heading", { name: "Timeline" }).locator("xpath=ancestor::section[1]");
    await expect(timeline.getByText("Completed")).toBeVisible();
    await expect(timeline.getByText("Pending")).toBeVisible();
  });

  test("edit and cancel a booking with a reason @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/bookings");
    await settle(page);
    await page.getByRole("combobox", { name: "Status" }).selectOption("pending");
    await settle(page);
    await page.locator("tbody tr").first().click();
    await page.getByRole("button", { name: "Edit" }).click();
    const dialog = page.getByRole("dialog", { name: /Edit booking/ });
    await dialog.getByLabel("Passengers").selectOption("3");
    await dialog.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/3 passengers/)).toBeVisible();

    await page.getByRole("button", { name: "Cancel booking" }).click();
    const cancel = page.getByRole("dialog", { name: /Cancel booking/ });
    await cancel.getByLabel("Reason").selectOption({ label: "Duplicate booking" });
    await cancel.getByRole("button", { name: "Cancel booking" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cancelled");
    await expect(page.getByText("Duplicate booking")).toBeVisible();
  });

  test("dispatch: assign from the queue and advance an active trip @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/dispatch");
    await settle(page);
    await expect(page.getByText(/Schematic mock map/)).toBeVisible();
    const queue = page.getByRole("heading", { name: "Ride queue" }).locator("xpath=ancestor::section[1]");
    const before = await queue.locator("li").count();
    test.skip(before === 0, "No unassigned rides in the generated data right now");
    await queue.getByRole("button", { name: "Assign" }).first().click();
    await page.getByRole("dialog", { name: /Assign a driver/ }).getByRole("button", { name: "Assign" }).click();
    await expect(page.getByText(/assigned to MSR-/)).toBeVisible();
    await expect(queue.locator("li")).toHaveCount(before - 1);

    const active = page.getByRole("heading", { name: "Active trips" }).locator("xpath=ancestor::section[1]");
    await active.getByRole("button", { name: "Driver en route" }).first().click();
    await expect(page.getByText(/Status updated to/)).toBeVisible();
  });

  test("role simulation hides navigation and blocks pages @responsive", async ({ page }) => {
    await page.goto("/en/admin");
    await settle(page);
    await switchRole(page, "Accountant");
    const nav = page.locator("aside nav");
    if (await nav.isVisible()) {
      await expect(nav.getByRole("link", { name: "Dispatch" })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Payments" })).toBeVisible();
    }
    await page.goto("/en/admin/dispatch");
    await expect(page.getByRole("heading", { name: "No access in this role" })).toBeVisible();
    await switchRole(page, "Administrator");
    await expect(page.getByRole("heading", { name: "Dispatch", level: 1 })).toBeVisible();
  });

  test("permission matrix changes apply to the simulated navigation @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/staff");
    await settle(page);
    await page.getByRole("checkbox", { name: "Support agent: View drivers" }).check();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved")).toBeVisible();
    await switchRole(page, "Support agent");
    await expect(page.locator("aside nav").getByRole("link", { name: "Drivers" })).toBeVisible();
    await expect(page.locator("aside nav").getByRole("link", { name: "Pricing" })).toHaveCount(0);
  });

  test("drivers: validation, create, search and detail drawer @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/drivers");
    await settle(page);
    await page.getByRole("button", { name: "Add driver" }).click();
    const dialog = page.getByRole("dialog", { name: "Add driver" });
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog.getByText("This field is required.").first()).toBeVisible();
    await dialog.getByLabel("First name").fill("Test");
    await dialog.getByLabel("Last name").fill("Driver");
    await dialog.getByLabel("Phone").fill("71 222 333");
    await dialog.getByLabel("License number").fill("LB-PUB-118204"); // already registered
    await dialog.getByLabel("License expiry date").fill("2028-12-31");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog.getByText("This license number is already registered.")).toBeVisible();
    await dialog.getByLabel("License number").fill("LB-TEST-000001");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("Driver Test Driver added")).toBeVisible();

    await page.getByRole("searchbox", { name: "Search" }).nth(1).fill("Test Driver");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.locator("tbody tr").first().click();
    const drawer = page.getByRole("dialog", { name: /Test Driver/ });
    await expect(drawer.getByText("Performance (last 30 days)")).toBeVisible();
    await expect(drawer.getByText("No trips yet.")).toBeVisible();
  });

  test("vehicles show document expiry and reject duplicate plates @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/vehicles");
    await settle(page);
    await expect(page.getByText(/documents expire within 30 days/)).toBeVisible();
    await expect(page.getByText(/^Registration: Expired$/).first()).toBeVisible();
    await page.locator("tbody tr").first().click();
    const dialog = page.getByRole("dialog", { name: /^Edit / });
    await dialog.getByLabel("Plate number").fill("B 100772");
    await dialog.getByRole("button", { name: "Save changes" }).click();
    const firstPlate = await page.locator("tbody tr").first().locator("td").first().textContent();
    if (firstPlate?.trim() !== "B 100772") await expect(dialog.getByText("This plate number is already registered.")).toBeVisible();
  });

  test("pricing edits drive the fare preview and new quotes @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/pricing");
    await settle(page);
    const preview = page.getByRole("heading", { name: "Fare preview" }).locator("xpath=ancestor::section[1]");
    const economy = preview.locator("li", { hasText: "Economy" });
    const before = await economy.textContent();
    await page.getByLabel("Economy — Per km").fill("2");
    await expect(economy).not.toHaveText(before!);
    await page.getByLabel("Economy — Per km").fill("");
    await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
    await page.getByLabel("Economy — Per km").fill("2");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved")).toBeVisible();
    await page.reload();
    await settle(page);
    await expect(page.getByLabel("Economy — Per km")).toHaveValue("2");
  });

  test("payments: filter transactions and record a driver settlement @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/payments");
    await settle(page);
    await page.getByRole("combobox", { name: "Method" }).selectOption("card");
    await settle(page);
    expect(new Set(await page.locator("tbody tr td:nth-child(4)").allTextContents())).toEqual(new Set(["Card"]));
    await page.getByText("Driver settlements", { exact: true }).click();
    await settle(page);
    await page.getByRole("button", { name: "Record settlement" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Record settlement" }).click();
    await expect(page.getByText(/Settlement recorded for/)).toBeVisible();
  });

  test("reports switch period and expose table views @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/reports");
    await settle(page);
    await page.getByText("Last 30 days", { exact: true }).click();
    await settle(page);
    await page.getByText("View as table").first().click();
    await expect(page.locator("details[open] tbody tr")).toHaveCount(30);
    await expect(page.getByRole("heading", { name: "Driver performance" })).toBeVisible();
  });

  test("notifications and settings @desktop-only", async ({ page }) => {
    await page.goto("/en/admin/notifications");
    await settle(page);
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await page.getByText("Unread", { exact: true }).first().click();
    await expect(page.getByText("You're all caught up.")).toBeVisible();

    await page.goto("/en/admin/settings");
    await settle(page);
    await page.getByLabel("Add area").fill("Zahle");
    await page.getByRole("button", { name: "Add area" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved")).toBeVisible();
    await page.reload();
    await settle(page);
    await expect(page.getByText("Zahle", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Reset demo data" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Reset demo data" }).click();
    await expect(page.getByText("Demo data reset")).toBeVisible();
    await expect(page.getByText("Zahle", { exact: true })).toHaveCount(0);
  });

  test("Arabic dashboard is right-to-left @responsive", async ({ page }) => {
    await page.goto("/ar/admin/bookings");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "الحجوزات", level: 1 })).toBeVisible();
    await settle(page);
    await expect(page.getByText(/نموذج أولي للواجهة/)).toBeVisible();
  });
});
