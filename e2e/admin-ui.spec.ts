import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFile } from "node:fs/promises";
import path from "node:path";

let html: string;
test.beforeAll(async () => {
  const bundled = await build({ entryPoints: ["e2e/fixtures/admin-manager.tsx"], bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" } });
  const css = await postcss([tailwind({ base: process.cwd() })]).process(await readFile("src/app/globals.css", "utf8"), { from: path.resolve("src/app/globals.css") });
  html = `<!DOCTYPE html><html lang="es-AR"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css.css}</style></head><body style="font-family: sans-serif"><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`;
});
test.beforeEach(async ({ page }) => {
  page.on("pageerror", error => console.error("Portal fixture:", error.message));
  await page.route("**/portal-test-fixture", route => route.fulfill({ contentType: "text/html", body: html }));
  await page.route("https://example.com/**", route => route.abort());
  await page.goto("http://127.0.0.1:3000/portal-test-fixture");
});

test("search matches names/SKU and invalid products cannot upload", async ({ page }) => {
  await expect(page.getByRole("listitem", { name: "Producto duplicado", exact: true }).getByRole("button")).toBeDisabled();
  await expect(page.getByRole("listitem", { name: "Producto sin SKU", exact: true }).getByRole("button")).toBeDisabled();
  await page.getByRole("searchbox").fill("gin-1");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Gin de prueba" })).toBeVisible();
  await page.getByRole("searchbox").fill("inexistente");
  await expect(page.getByText("No hay productos que coincidan con la búsqueda.")).toBeVisible();
});

test("cancel and quota error release the upload button", async ({ page }) => {
  const row = page.getByRole("listitem", { name: "Gin de prueba", exact: true });
  await row.getByRole("button").click();
  await page.evaluate(() => window.portalTest.emit("close"));
  await expect(row.getByText("Carga cancelada")).toBeVisible();
  await row.getByRole("button").click();
  await page.evaluate(() => window.portalTest.fail("Quota exceeded"));
  await expect(row.getByRole("alert")).toContainText("plan gratuito");
  await expect(row.getByRole("button")).toBeEnabled();
});

test("successful upload updates only its row and failed save can retry without reupload", async ({ page }) => {
  const row = page.getByRole("listitem", { name: "Gin de prueba", exact: true });
  await row.getByRole("button").click();
  await page.evaluate(() => {
    window.portalTest.rejectSave = true;
    window.portalTest.emit("queues-start");
  });
  await expect(row.getByText("Subiendo imagen…")).toBeVisible();
  await page.evaluate(() => window.portalTest.emit("success", { public_id: "test/gin", version: 123, signature: "signed-receipt" }));
  await expect(row.getByRole("button", { name: "Reintentar guardado" })).toBeVisible();
  await page.evaluate(() => { window.portalTest.rejectSave = false; });
  await row.getByRole("button", { name: "Reintentar guardado" }).click();
  await expect(row.getByText("Imagen guardada")).toBeVisible();
  await expect(row.getByRole("button", { name: "Reemplazar imagen" })).toBeVisible();
  expect(await page.evaluate(() => window.portalTest.saves)).toBe(2);
  await expect(page.getByText("Imagen guardada", { exact: true })).toHaveCount(1);
});

for (const width of [390, 768, 1440]) {
  test(`rows fit the ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("listitem")).toHaveCount(4);
    const rows = await page.getByRole("listitem").evaluateAll(items => items.map(item => ({ x: item.getBoundingClientRect().x, y: item.getBoundingClientRect().y })));
    expect(new Set(rows.map(row => row.x)).size).toBe(1);
    expect(rows[1].y).toBeGreaterThan(rows[0].y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/admin-${width}.png`, fullPage: true });
  });
}

test("upload state follows SKU after Sheets rows change", async ({ page }) => {
  const row = page.getByRole("listitem", { name: "Gin de prueba", exact: true });
  await row.getByRole("button").click();
  await page.evaluate(() => window.portalTest.emit("success", { public_id: "test/gin", version: 123, signature: "receipt" }));
  await expect(row.getByText("Imagen guardada")).toBeVisible();
  await page.evaluate(() => window.portalTest.reorder?.());
  await expect(row.getByText("Imagen guardada")).toBeVisible();
  await expect(page.getByRole("listitem", { name: "Producto sin SKU", exact: true }).getByText("Imagen guardada")).toHaveCount(0);
});

test("a cancelled signature request cannot close a newer upload", async ({ page }) => {
  let respond: (() => Promise<void>) | undefined;
  await page.route("**/api/admin/uploads/sign", route => { respond = () => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Firma fallida" }) }); });
  const first = page.getByRole("listitem", { name: "Gin de prueba", exact: true });
  const second = page.getByRole("listitem").nth(1);
  await first.getByRole("button").click();
  await page.evaluate(() => window.portalTest.options?.uploadSignature(() => {}, {}));
  await expect.poll(() => Boolean(respond)).toBe(true);
  await page.evaluate(() => window.portalTest.emit("close"));
  await second.getByRole("button").click();
  await respond!();
  await expect(first.getByText("Firma fallida")).toHaveCount(0);
  await expect(second.getByRole("button")).toBeDisabled();
  await page.evaluate(() => window.portalTest.emit("success", { public_id: "test/vino", version: 123, signature: "receipt" }));
  await expect(second.getByText("Imagen guardada")).toBeVisible();
});
