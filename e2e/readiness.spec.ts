import { expect, test } from "@playwright/test";

test("landing page renders the StreamWage hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Launch app" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Stream salaries in/i }),
  ).toBeVisible();
});

test("landing page explains the cUSD + MiniPay flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Per-second cUSD streams")).toBeVisible();
  await expect(page.getByText("Claim in MiniPay")).toBeVisible();
  await expect(page.getByText("Self-verified workers")).toBeVisible();
});

test("how-it-works shows the three payroll steps", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Fund payroll")).toBeVisible();
  await expect(page.getByText("Verify & stream")).toBeVisible();
  await expect(page.getByText("Claim in MiniPay").first()).toBeVisible();
});
