import { test, expect } from "@playwright/test";
import { loginAsFacilitator } from "./fixtures/auth";

test.describe("View results", () => {
  test("sessions list page loads for authenticated user", async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_TEST_EMAIL,
      "Requires PLAYWRIGHT_TEST_EMAIL env var"
    );
    await loginAsFacilitator(page);
    await page.goto("/v2/seances");
    await expect(page).toHaveURL(/\/v2\/seances/);
    // Should show the sessions page (title or empty state)
    await expect(
      page.locator("h1, [data-testid='empty-state']")
    ).toBeVisible({ timeout: 5000 });
  });

  test("statistics page loads", async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_TEST_EMAIL,
      "Requires PLAYWRIGHT_TEST_EMAIL env var"
    );
    await loginAsFacilitator(page);
    await page.goto("/v2/statistiques");
    await expect(page).toHaveURL(/\/v2\/statistiques/);
  });
});
