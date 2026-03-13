import { test as base, expect } from "@playwright/test";

/**
 * Auth fixture — logs in once and reuses storageState.
 * Requires PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD env vars.
 */
export const test = base.extend<{ authenticatedPage: typeof base }>({});

export async function loginAsFacilitator(
  page: import("@playwright/test").Page
) {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD env vars"
    );
  }

  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/v2**", { timeout: 10_000 });
}

export { expect };
