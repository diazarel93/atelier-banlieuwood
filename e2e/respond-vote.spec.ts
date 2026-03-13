import { test, expect } from "@playwright/test";

test.describe("Respond and vote flow", () => {
  test.skip(true, "Requires active session with students — manual test");

  test("student can submit a response", async ({ page }) => {
    // This test requires a live session
    // Left as a placeholder for CI integration
    await page.goto("/play/test-session-id");
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("student can vote on responses", async ({ page }) => {
    // This test requires a session in voting phase
    await page.goto("/play/test-session-id");
    await expect(page.locator('[data-vote]')).toBeVisible();
  });
});
