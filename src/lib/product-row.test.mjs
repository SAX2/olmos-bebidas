import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { parseProductRow } from "./product-row.ts";

test("maps product rows with SKU in column A and keeps SKU internal", () => {
  const product = parseProductRow([
    "SKU-001",
    "Coca-Cola 2.25L",
    "$2.500",
    "si",
    "https://drive.google.com/file/d/image-id/view",
    "Gaseosas",
    6,
    "monto",
    500,
    "si",
  ]);

  assert.deepEqual(product, {
    id: "SKU-001",
    sku: "SKU-001",
    nombre: "Coca-Cola 2.25L",
    precio: 2500,
    visibilidad: true,
    imagen: "https://lh3.googleusercontent.com/d/image-id",
    categoria: "Gaseosas",
    cantidadMaxima: 6,
    descuentoTipo: "monto",
    descuento: 500,
    destacado: true,
  });
});

test("falls back to product name as internal id when SKU is blank", () => {
  const product = parseProductRow([
    "",
    "Agua sin gas",
    1200,
    "si",
    "",
    "Aguas",
  ]);

  assert.equal(product?.id, "Agua sin gas");
  assert.equal(product?.sku, "");
});

test("uses a schema-versioned products cache key", () => {
  const sheetsSource = fs.readFileSync(
    new URL("./sheets.ts", import.meta.url),
    "utf8",
  );

  assert.match(sheetsSource, /unstable_cache\(fetchProducts,\s*\["products-v2"\]/);
});
