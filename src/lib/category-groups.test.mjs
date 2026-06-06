import assert from "node:assert/strict";
import test from "node:test";
import { parseCategoryGroups } from "./category-groups.ts";

test("parses structured category sheet rows and ignores helper rows", () => {
  const groups = parseCategoryGroups([
    ["Categoria", "Subcategorias", "Notas"],
    [
      "Categorias principales para la web",
      "Subcategorias sugeridas",
      "Promos no es una categoria",
    ],
    ["Destilados", "Whisky | Gin | Vodka", "Bebidas espirituosas"],
    ["Sin alcohol", "Gaseosas | Aguas", "Bebidas sin alcohol"],
    ["", "", ""],
  ]);

  assert.deepEqual(groups, [
    {
      category: "Destilados",
      subcategories: ["Whisky", "Gin", "Vodka"],
      note: "Bebidas espirituosas",
    },
    {
      category: "Sin alcohol",
      subcategories: ["Gaseosas", "Aguas"],
      note: "Bebidas sin alcohol",
    },
  ]);
});

test("falls back to the new taxonomy for the current flat category sheet shape", () => {
  const groups = parseCategoryGroups([
    ["Categorias"],
    ["Vinos"],
    ["Cervezas"],
    ["Whisky"],
  ]);

  assert.equal(groups.length, 8);
  assert.deepEqual(
    groups.map((group) => group.category),
    [
      "Combos",
      "Vinos y espumantes",
      "Cervezas",
      "Destilados",
      "Aperitivos y coctelería",
      "Sin alcohol",
      "Snacks y almacén",
      "Regalos y varios",
    ],
  );
  assert.deepEqual(
    groups.find((group) => group.category === "Destilados")?.subcategories,
    ["Whisky", "Gin", "Vodka", "Ron", "Tequila", "Licores", "Pisco", "Coñac", "Grapas"],
  );
});
