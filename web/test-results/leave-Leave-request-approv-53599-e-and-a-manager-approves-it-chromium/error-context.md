# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leave.spec.ts >> Leave request + approval >> a developer submits leave and a manager approves it
- Location: e2e\leave.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Request approved')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Request approved')

```

```yaml
- complementary:
  - text: D DevPulse Productivity Tracker
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
      - img
      - text: Dashboard
    - link "Projects":
      - /url: /projects
      - img
      - text: Projects
    - link "Tasks":
      - /url: /tasks
      - img
      - text: Tasks
    - link "Daily Logs":
      - /url: /daily-logs
      - img
      - text: Daily Logs
    - link "Leave":
      - /url: /leave
      - img
      - text: Leave
    - link "Reports":
      - /url: /reports
      - img
      - text: Reports
    - link "Team":
      - /url: /team
      - img
      - text: Team
  - link "R Rahul Sharma Manager":
    - /url: /profile
  - button "Sign out":
    - img
    - text: Sign out
- banner:
  - button "Notifications":
    - img
    - text: "4"
  - button "Switch to dark theme":
    - img
- main:
  - heading "Leave" [level=1]
  - paragraph: Request time off and track approvals.
  - button "My Leave"
  - button "Team Requests"
  - table:
    - rowgroup:
      - row "Employee Type Dates Days Status":
        - columnheader "Employee"
        - columnheader "Type"
        - columnheader "Dates"
        - columnheader "Days"
        - columnheader "Status"
        - columnheader
    - rowgroup:
      - row "Priya Verma Casual 2026-07-25 → 2026-07-25 1.0 Pending Approve Reject":
        - cell "Priya Verma"
        - cell "Casual"
        - cell "2026-07-25 → 2026-07-25"
        - cell "1.0"
        - cell "Pending"
        - cell "Approve Reject":
          - button "Approve"
          - button "Reject"
      - row "Priya Verma Casual 2026-07-25 → 2026-07-25 1.0 Pending Approve Reject":
        - cell "Priya Verma"
        - cell "Casual"
        - cell "2026-07-25 → 2026-07-25"
        - cell "1.0"
        - cell "Pending"
        - cell "Approve Reject":
          - button "Approve"
          - button "Reject"
      - row "Priya Verma Casual 2026-07-25 → 2026-07-25 1.0 Pending Approve Reject":
        - cell "Priya Verma"
        - cell "Casual"
        - cell "2026-07-25 → 2026-07-25"
        - cell "1.0"
        - cell "Pending"
        - cell "Approve Reject":
          - button "Approve"
          - button "Reject"
      - row "Priya Verma Casual 2026-07-25 → 2026-07-25 1.0 Approved":
        - cell "Priya Verma"
        - cell "Casual"
        - cell "2026-07-25 → 2026-07-25"
        - cell "1.0"
        - cell "Approved"
        - cell
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { DEMO_USERS, login, uniqueName } from "./helpers";
  3  | 
  4  | test.describe("Leave request + approval", () => {
  5  |   test("a developer submits leave and a manager approves it", async ({ browser }) => {
  6  |     const devContext = await browser.newContext();
  7  |     const devPage = await devContext.newPage();
  8  |     await login(devPage, DEMO_USERS.developer.email, DEMO_USERS.developer.password);
  9  |     await devPage.goto("/leave");
  10 | 
  11 |     const reason = uniqueName("E2E leave reason");
  12 |     await devPage.getByRole("button", { name: "Request leave" }).click();
  13 |     const today = new Date().toISOString().slice(0, 10);
  14 |     await devPage.locator('[formcontrolname="start_date"]').fill(today);
  15 |     await devPage.locator('[formcontrolname="end_date"]').fill(today);
  16 |     await devPage.locator('[formcontrolname="reason"]').fill(reason);
  17 |     await devPage.getByRole("button", { name: "Submit request" }).click();
  18 | 
  19 |     const myRow = devPage.locator("tr", { hasText: reason });
  20 |     await expect(myRow).toBeVisible({ timeout: 10000 });
  21 |     await expect(myRow).toContainText("Pending");
  22 |     await devContext.close();
  23 | 
  24 |     const mgrContext = await browser.newContext();
  25 |     const mgrPage = await mgrContext.newPage();
  26 |     await login(mgrPage, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
  27 |     await mgrPage.goto("/leave");
  28 |     await mgrPage.getByRole("button", { name: "Team Requests" }).click();
  29 | 
  30 |     // The team-requests table doesn't render the request's reason, only employee/type/
  31 |     // dates/status — but the backend orders Pending-first then newest-first, so the top
  32 |     // "Priya Verma" + "Pending" row is the one just submitted above. The list re-sorts
  33 |     // after approval (Pending rows float to the top), so we confirm success via the
  34 |     // toast rather than re-querying the now-reordered row.
  35 |     const row = mgrPage.locator("tr", { hasText: "Priya Verma" }).filter({ hasText: "Pending" }).first();
  36 |     await expect(row).toBeVisible({ timeout: 10000 });
  37 |     await row.getByRole("button", { name: "Approve" }).click();
  38 |     await mgrPage.screenshot({ path: "debug-after-approve.png" });
  39 | 
> 40 |     await expect(mgrPage.getByText("Request approved")).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  41 |     await mgrContext.close();
  42 |   });
  43 | });
  44 | 
```