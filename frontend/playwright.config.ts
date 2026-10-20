import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * E2E tests run against a fresh production build with the admin prototype
 * enabled (it is disabled in normal production builds — see src/config/features.ts).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Use the locally installed Chrome — no browser download needed.
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    {
      name: "tablet",
      use: { ...devices["iPad Pro 11 landscape"], browserName: "chromium", channel: "chrome" },
      grep: /@responsive/,
    },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" }, grepInvert: /@desktop-only/ },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    env: { ADMIN_PROTOTYPE: "true" },
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: false,
    timeout: 600_000,
  },
});
