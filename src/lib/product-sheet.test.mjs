import assert from "node:assert/strict";
import test from "node:test";
import { readAdminProducts, imageCellForSku } from "./product-sheet.ts";

const rows = [
  ["Imagen", "Precio", "SKU", "Producto", "Visibilidad"],
  ["subheaders"],
  ["", 0, "B", "Oculto", "no"],
  ["https://example.com/a.png", 20, "A", "Visible", "si"],
  ["", 0, "", "Sin código", "no"],
];
test("admin includes hidden/unpriced products and flags missing SKU", () => {
  const products = readAdminProducts(rows);
  assert.deepEqual(products.map(p => p.nombre), ["Oculto", "Visible", "Sin código"]);
  assert.equal(products[2].issue, "missing-sku");
  assert.equal(products[0].issue, null);
});
test("duplicates, including unnamed rows, block every matching SKU", () => {
  const duplicate = [...rows, ["", 0, " B ", "", "no"]];
  assert.equal(readAdminProducts(duplicate)[0].issue, "duplicate-sku");
  assert.throws(() => imageCellForSku(duplicate, "B", "Productos"), /duplicado/i);
});
test("save resolves current row and column, never a stale client row", () => {
  assert.equal(imageCellForSku(rows, "A", "Productos"), "'Productos'!A4");
  const reordered = [rows[0], rows[1], rows[3], rows[2]];
  assert.equal(imageCellForSku(reordered, "A", "Productos"), "'Productos'!A3");
  assert.equal(imageCellForSku(rows, "B", "'Mi planilla'!A:Z"), "'Mi planilla'!A3");
});
test("reject missing/ambiguous headers, missing products and unsafe partial ranges", () => {
  assert.throws(() => imageCellForSku(rows, "", "Productos"));
  assert.throws(() => imageCellForSku(rows, "Z", "Productos"));
  assert.throws(() => readAdminProducts([["SKU", "Producto"], [], ["A", "Uno"]]));
  assert.throws(() => readAdminProducts([["SKU", "SKU", "Imagen", "Producto"]]));
  assert.throws(() => imageCellForSku(rows, "A", "Productos!B3:Z"));
});
