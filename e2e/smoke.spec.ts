import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("client app loads successfully", async ({ page }) => {
    await page.goto("/");

    // Verify the main heading renders
    await expect(page.locator("h1")).toContainText("bEvr");

    // Verify subheading
    await expect(page.locator("h2")).toContainText(
      "Bun + Effect + Vite + React",
    );
  });

  test("server health endpoint responds", async ({ request }) => {
    const response = await request.get("http://localhost:9000");
    expect(response.ok()).toBeTruthy();
  });

  test("REST request returns the server greeting", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Call REST API" }).click();
    await expect(
      page.getByText("Message: Hello bEvr!", { exact: false }),
    ).toContainText("Success: true");
  });

  test("HTTP RPC stream reaches its final event", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Call RPC API" }).click();
    await expect(page.getByText("Event: end", { exact: false })).toContainText(
      "Start.......... End",
      { timeout: 15000 },
    );
  });

  test("WebSocket presence broadcasts status changes", async ({ page }) => {
    await page.goto("/");
    const self = page.getByRole("listitem").filter({ hasText: "you" });
    await expect(self).toContainText("(online)");
    await page.getByRole("button", { name: "Away", exact: true }).click();
    await expect(self).toContainText("(away)");
    await page.getByRole("button", { name: "Busy", exact: true }).click();
    await expect(self).toContainText("(busy)");
  });

  // Visual regression test - compares against committed baseline
  // Update with: bun run test:e2e -- --update-snapshots
  test("app layout matches visual baseline", async ({ page }) => {
    await page.goto("/");

    // Wait for the app to fully render
    await expect(page.locator("h1")).toContainText("bEvr");

    await expect(
      page.getByRole("heading", { name: "Connected Clients (1)", exact: true }),
    ).toBeVisible();

    // Take full page screenshot and compare against baseline
    // Allow small pixel differences for dynamic content (timestamps, connection status)
    await expect(page).toHaveScreenshot("app-layout.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02, // Allow up to 2% pixel difference
    });
  });
});
