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
    // Select an avatar
    await page.locator("button").filter({ hasText: /^🎬$/ }).click();
    // Try to join via data-testid button
    await page.locator('[data-testid="join-submit"]').click();
    // Should show error toast (Sonner) or alert
    await expect(
      page.locator('[data-sonner-toast][data-type="error"], [role="alert"]')
    ).toBeVisible({ timeout: 5000 });
  });

  test("pre-fills code from query param", async ({ page }) => {
    await page.goto("/join?code=ABC123");
    const inputs = page.locator('input[maxlength="1"]');
    await expect(inputs.nth(0)).toHaveValue("A");
    await expect(inputs.nth(1)).toHaveValue("B");
    await expect(inputs.nth(2)).toHaveValue("C");
    await expect(inputs.nth(3)).toHaveValue("1");
    await expect(inputs.nth(4)).toHaveValue("2");
    await expect(inputs.nth(5)).toHaveValue("3");
  });
});
