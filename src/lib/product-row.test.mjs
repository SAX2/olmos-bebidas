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
    categoria: "Sin alcohol",
    subcategoria: "Gaseosas",
    cantidadMaxima: 6,
    descuentoTipo: "monto",
    descuento: 500,
    destacado: true,
  });
});

test("maps product rows by header and includes subcategory when present", () => {
  const product = parseProductRow(
    [
      "SKU-002",
      "Gin Heraclito",
      "$18.500",
      "si",
      "",
      "Destilados",
      8,
      "",
      "",
      "no",
      "Gin",
      "Gin",
    ],
    [
      "SKU",
      "Producto",
      "Precio",
      "Visibilidad",
      "Imagen",
      "Categoria",
      "Stock",
      "Tipo Descuento",
      "Descuento",
      "Destacado",
      "Subcategoria",
      "Categoria Original",
    ],
  );

  assert.equal(product?.categoria, "Destilados");
  assert.equal(product?.subcategoria, "Gin");
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
  assert.equal(product?.categoria, "Sin alcohol");
  assert.equal(product?.subcategoria, "Aguas");
});

test("uses a schema-versioned products cache key", () => {
  const sheetsSource = fs.readFileSync(
    new URL("./sheets.ts", import.meta.url),
    "utf8",
  );

  assert.match(sheetsSource, /unstable_cache\(fetchProducts,\s*\["products-v3"\]/);
});
