import { test, expect } from "@playwright/test";
import { loginAsFacilitator } from "./fixtures/auth";

test.describe("Login flow", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/v2");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login form with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows Google OAuth button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Continuer avec Google")).toBeVisible();
  });

  test("shows signup toggle", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Pas encore de compte");
    await expect(page.locator('input[placeholder="Ton nom"]')).toBeVisible();
  });

  test("facilitator can login and reach /v2", async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_TEST_EMAIL,
      "Requires PLAYWRIGHT_TEST_EMAIL env var"
    );
    await loginAsFacilitator(page);
    await expect(page).toHaveURL(/\/v2/);
  });
});
