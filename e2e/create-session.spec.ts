import { test, expect } from "@playwright/test";
import { loginAsFacilitator } from "./fixtures/auth";

test.describe("Create session", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_TEST_EMAIL,
      "Requires PLAYWRIGHT_TEST_EMAIL env var"
    );
    await loginAsFacilitator(page);
  });

  test("can navigate to new session page", async ({ page }) => {
    await page.click('a[href="/v2/seances/new"]');
    await expect(page).toHaveURL(/\/v2\/seances\/new/);
  });

  test("session creation wizard shows title input", async ({ page }) => {
    await page.goto("/v2/seances/new");
    await expect(
      page.locator('input[placeholder*="Séance"]')
    ).toBeVisible();
  });
});
