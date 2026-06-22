import { expect, test } from "@playwright/test";

test("StreamWage renders the Celo payroll workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "StreamWage" })).toBeVisible();
  await expect(page.getByText("Mento cUSD")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Employer console" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Worker claim" })).toBeVisible();
});

test("worker claim panel keeps the MiniPay flow front and center", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Claimable now")).toBeVisible();
  await expect(page.getByRole("button", { name: "Claim accrued cUSD" })).toBeVisible();
  await expect(page.getByText("MiniPay ready")).toBeVisible();
});

test("desktop wallet modal remains available outside MiniPay", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /connect wallet/i }).click();
  await expect(page.getByText("Connect a Wallet")).toBeVisible();
});
