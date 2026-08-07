import { Page, expect } from "@playwright/test";

export const DEMO_USERS = {
  admin: { email: "admin@devpulse.com", password: "Admin@123", name: "Admin" },
  manager: { email: "rahul@devpulse.com", password: "Admin@123", name: "Rahul" },
  developer: { email: "priya@devpulse.com", password: "Admin@123", name: "Priya" }
} as const;

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("you@company.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
