import { test, expect } from "@playwright/test";
import { DEMO_USERS, login, uniqueName } from "./helpers";

test.describe("Leave request + approval", () => {
  test("a developer submits leave and a manager approves it", async ({ browser }) => {
    const devContext = await browser.newContext();
    const devPage = await devContext.newPage();
    await login(devPage, DEMO_USERS.developer.email, DEMO_USERS.developer.password);
    await devPage.goto("/leave");

    const reason = uniqueName("E2E leave reason");
    await devPage.getByRole("button", { name: "Request leave" }).click();
    const today = new Date().toISOString().slice(0, 10);
    await devPage.locator('[formcontrolname="start_date"]').fill(today);
    await devPage.locator('[formcontrolname="end_date"]').fill(today);
    await devPage.locator('[formcontrolname="reason"]').fill(reason);
    await devPage.getByRole("button", { name: "Submit request" }).click();

    const myRow = devPage.locator("tr", { hasText: reason });
    await expect(myRow).toBeVisible({ timeout: 10000 });
    await expect(myRow).toContainText("Pending");
    await devContext.close();

    const mgrContext = await browser.newContext();
    const mgrPage = await mgrContext.newPage();
    await login(mgrPage, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
    await mgrPage.goto("/leave");
    await mgrPage.getByRole("button", { name: "Team Requests" }).click();

    // The team-requests table doesn't render the request's reason, only employee/type/
    // dates/status — but the backend orders Pending-first then newest-first, so the top
    // "Priya Verma" + "Pending" row is the one just submitted above. The list re-sorts
    // after approval (Pending rows float to the top), so we confirm success via the
    // toast rather than re-querying the now-reordered row.
    const row = mgrPage.locator("tr", { hasText: "Priya Verma" }).filter({ hasText: "Pending" }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByRole("button", { name: "Approve" }).click();
    await mgrPage.screenshot({ path: "debug-after-approve.png" });

    await expect(mgrPage.getByText("Request approved")).toBeVisible({ timeout: 10000 });
    await mgrContext.close();
  });
});
