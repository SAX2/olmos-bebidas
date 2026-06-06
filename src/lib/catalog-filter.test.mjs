import assert from "node:assert/strict";
import test from "node:test";
import { filterProducts } from "./catalog-filter.ts";

const products = [
  {
    id: "1",
    sku: "1",
    nombre: "Gin Heraclito",
    precio: 18500,
    visibilidad: true,
    imagen: "",
    categoria: "Destilados",
    subcategoria: "Gin",
    cantidadMaxima: 10,
  },
  {
    id: "2",
    sku: "2",
    nombre: "Whisky J&B",
    precio: 22000,
    visibilidad: true,
    imagen: "",
    categoria: "Destilados",
    subcategoria: "Whisky",
    cantidadMaxima: 10,
    descuento: 20,
    descuentoTipo: "porcentaje",
  },
  {
    id: "3",
    sku: "3",
    nombre: "Coca-Cola 2.25L",
    precio: 3500,
    visibilidad: true,
    imagen: "",
    categoria: "Sin alcohol",
    subcategoria: "Gaseosas",
    cantidadMaxima: 10,
  },
];

test("filters by category, subcategory, and search without clearing filters", () => {
  const result = filterProducts(products, {
    searchQuery: "gin",
    selectedFeature: "Todos",
    selectedCategory: "Destilados",
    selectedSubcategory: "Gin",
  });

  assert.deepEqual(
    result.map((product) => product.nombre),
    ["Gin Heraclito"],
  );
});

test("promos feature remains dynamic from discounts or featured products", () => {
  const result = filterProducts(products, {
    searchQuery: "",
    selectedFeature: "Promos",
    selectedCategory: "Todos",
    selectedSubcategory: "Todos",
  });

  assert.deepEqual(
    result.map((product) => product.nombre),
    ["Whisky J&B"],
  );
});
