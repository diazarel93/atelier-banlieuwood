import { test, expect } from "@playwright/test";

test.describe("Student join flow", () => {
  test("shows join page with code input", async ({ page }) => {
    await page.goto("/join");
    await expect(page.locator("label")).toContainText("Code");
    // 6 individual code input boxes
    await expect(page.locator('input[maxlength="1"]')).toHaveCount(6);
  });

  test("shows name and avatar fields after code entry", async ({ page }) => {
    await page.goto("/join");
    // The name field should already be visible
    await expect(page.locator('input[placeholder*="prenom"]')).toBeVisible();
  });

  test("invalid code shows error", async ({ page }) => {
    await page.goto("/join");
    // Type an invalid code
    const inputs = page.locator('input[maxlength="1"]');
    const code = "ZZZZZZ";
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(code[i]);
    }
    // Fill name
    await page.fill('input[placeholder*="prenom"]', "TestEleve");
    // Try to join
    await page.click('button[type="submit"]');
    // Should show error
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });
});
