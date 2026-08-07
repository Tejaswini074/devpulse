import { test, expect } from "@playwright/test";
import { DEMO_USERS, login } from "./helpers";

test.describe("Auth", () => {
  test("logging in with valid credentials reaches the dashboard", async ({ page }) => {
    await login(page, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    // Sidebar should show the signed-in user's name.
    await expect(page.locator("aside")).toContainText("Rahul");
  });

  test("logging in with a wrong password shows an error and stays on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@company.com").fill(DEMO_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill("definitely-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test("logging out returns to /login and blocks access to protected routes", async ({ page }) => {
    await login(page, DEMO_USERS.developer.email, DEMO_USERS.developer.password);

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
