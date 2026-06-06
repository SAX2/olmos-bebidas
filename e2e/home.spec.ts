import { expect, test } from "@playwright/test";

test("loads the catalog shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByPlaceholder("Buscar entre productos...")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Destacados" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Categorias" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Promos", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Combos", exact: true }).first()).toBeVisible();
});

test("category selection reveals subcategories and preserves search filters", async ({
  page,
}) => {
  await page.goto("/");

  const destilados = page.getByRole("button", {
    name: "Destilados",
    exact: true,
  }).first();
  await destilados.click();

  await expect(destilados).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Subcategorias" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Todos", exact: true }).first()).toBeVisible();

  const gin = page.getByRole("button", { name: "Gin", exact: true }).first();
  await gin.click();
  await expect(gin).toHaveAttribute("aria-pressed", "true");

  await page.getByPlaceholder("Buscar entre productos...").fill("gin");

  await expect(destilados).toHaveAttribute("aria-pressed", "true");
  await expect(gin).toHaveAttribute("aria-pressed", "true");
});

test("mobile filters stay within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByPlaceholder("Buscar entre productos...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Promos", exact: true }).last()).toBeVisible();
  await expect(page.getByRole("button", { name: "Destilados", exact: true }).last()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("wide desktop uses the expanded viewport and four product columns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");

  const searchBox = page.getByRole("searchbox", { name: "Buscar productos" });
  const searchBoxBounds = await searchBox.boundingBox();
  expect(searchBoxBounds?.width ?? 0).toBeGreaterThan(1050);

  const products = page.locator("article");
  await expect(products.nth(3)).toBeVisible();

  const firstRowY = await Promise.all(
    [0, 1, 2, 3].map(async (index) => {
      const box = await products.nth(index).boundingBox();
      return Math.round(box?.y ?? -1);
    }),
  );

  expect(new Set(firstRowY).size).toBe(1);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("wide desktop aligns the navbar to the expanded page frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");

  const logoLink = page.locator("header a").first();
  const logoBounds = await logoLink.boundingBox();

  expect(logoBounds?.x ?? 999).toBeLessThan(80);
});
