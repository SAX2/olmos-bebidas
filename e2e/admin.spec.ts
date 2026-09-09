import { expect, test } from "@playwright/test";

test("admin redirects visitors to login without exposing products", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Imágenes de productos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Subir imagen", exact: true })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("upload signatures require an admin session", async ({ request }) => {
  const response = await request.post("/api/admin/uploads/sign", { data: { sku: "A", params: {} } });
  expect(response.status()).toBe(401);
  expect(await response.json()).not.toHaveProperty("signature");
});
