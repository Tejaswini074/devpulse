import { test, expect } from "@playwright/test";
import { DEMO_USERS, login, uniqueName } from "./helpers";

async function createTask(page: import("@playwright/test").Page, title: string): Promise<void> {
  await page.getByRole("button", { name: "New task" }).click();
  await page.locator('[formcontrolname="title"]').fill(title);
  await page.locator('[formcontrolname="project_id"]').selectOption({ index: 1 });
  await page.locator('[formcontrolname="assigned_to"]').selectOption({ index: 1 });
  await page.getByRole("button", { name: "Create task" }).click();
}

test.describe("Tasks kanban board", () => {
  test("creates a task, finds it via the search filter, and opens its detail", async ({ page }) => {
    await login(page, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
    await page.goto("/tasks");

    const title = uniqueName("E2E task");
    await createTask(page, title);

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });

    // Search filter narrows the board down to just this card.
    await page.getByPlaceholder("Search tasks...").fill(uniqueName("no such task"));
    await expect(page.getByText(title)).toHaveCount(0);
    await page.getByPlaceholder("Search tasks...").fill(title);
    await expect(page.getByText(title)).toBeVisible();

    // Opening the card shows the task detail modal.
    await page.getByText(title).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("dragging a card to another column updates its status", async ({ page }) => {
    await login(page, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
    await page.goto("/tasks");

    const title = uniqueName("E2E drag task");
    await createTask(page, title);

    const card = page.getByText(title);
    await expect(card).toBeVisible({ timeout: 10000 });

    const inProgressColumn = page.locator("[id='In Progress']");
    const sourceBox = await card.boundingBox();
    const targetBox = await inProgressColumn.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("Could not measure drag source/target");

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, sourceBox.y, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 20, { steps: 5 });
    await page.mouse.up();

    await expect(inProgressColumn.getByText(title)).toBeVisible({ timeout: 10000 });
  });

  test("adds a comment and uploads an attachment on a task", async ({ page }) => {
    await login(page, DEMO_USERS.manager.email, DEMO_USERS.manager.password);
    await page.goto("/tasks");

    const title = uniqueName("E2E comment task");
    await createTask(page, title);
    await page.getByText(title).click();

    const commentText = uniqueName("Looks good to me");
    await page.getByPlaceholder("Add a comment...").fill(commentText);
    await page.getByRole("button", { name: "Comment" }).click();
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10000 });

    await page.setInputFiles('input[type="file"]', {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("e2e attachment contents")
    });
    await expect(page.getByText("notes.txt")).toBeVisible({ timeout: 10000 });
  });
});
