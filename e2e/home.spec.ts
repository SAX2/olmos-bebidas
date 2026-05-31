import { expect, test } from "@playwright/test";

test("loads the catalog shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByPlaceholder("Buscar productos...")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Filtrar por categoría" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Todos", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Promociones", exact: true }),
  ).toBeVisible();
});
