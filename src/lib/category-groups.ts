import type { CategoryGroup } from "@/types/product";

export const DEFAULT_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    category: "Combos",
    subcategories: ["Combos"],
    note: "Promos queda como filtro dinamico por Destacado o Descuento.",
  },
  {
    category: "Vinos y espumantes",
    subcategories: ["Vinos", "Espumantes", "Champagne"],
    note: "Familia para vinos tranquilos, espumantes y champagne.",
  },
  {
    category: "Cervezas",
    subcategories: ["Cervezas", "Listas para tomar"],
    note: "Incluye cervezas y bebidas alcoholicas gasificadas/RTD.",
  },
  {
    category: "Destilados",
    subcategories: [
      "Whisky",
      "Gin",
      "Vodka",
      "Ron",
      "Tequila",
      "Licores",
      "Pisco",
      "Coñac",
      "Grapas",
    ],
    note: "Bebidas espirituosas y licores.",
  },
  {
    category: "Aperitivos y coctelería",
    subcategories: [
      "Aperitivos",
      "Vermouth",
      "Botánicos",
      "Pulpas",
      "Hielo",
      "Copas y utensilios",
    ],
    note: "Insumos para aperitivo, cocteles y servicio.",
  },
  {
    category: "Sin alcohol",
    subcategories: [
      "Gaseosas",
      "Aguas",
      "Agua saborizada",
      "Jugos",
      "Energizantes",
      "Sin alcohol",
    ],
    note: "Bebidas sin alcohol.",
  },
  {
    category: "Snacks y almacén",
    subcategories: [
      "Snacks",
      "Alfajores",
      "Chocolates",
      "Golosinas",
      "Conservas",
      "Mermeladas",
      "Aceite de oliva",
    ],
    note: "Kiosco, picadas y almacen.",
  },
  {
    category: "Regalos y varios",
    subcategories: [
      "Estuchería y regalos",
      "Artículos para fumar",
      "Preservativos",
      "Varios",
    ],
    note: "Regalos, accesorios no gastronomicos y miscelaneos.",
  },
];

const MAIN_CATEGORY_NAMES = new Set(
  DEFAULT_CATEGORY_GROUPS.map((group) => group.category),
);

const BASE_CATEGORY_MAP = new Map<string, [string, string]>([
  ["Combos y Promociones", ["Combos", "Combos"]],
  ["Combos", ["Combos", "Combos"]],
  ["Vinos", ["Vinos y espumantes", "Vinos"]],
  ["Espumantes", ["Vinos y espumantes", "Espumantes"]],
  ["Champagne", ["Vinos y espumantes", "Champagne"]],
  ["Cervezas", ["Cervezas", "Cervezas"]],
  ["Bebidas Alcohólicas Gasificadas", ["Cervezas", "Listas para tomar"]],
  ["Listas para tomar", ["Cervezas", "Listas para tomar"]],
  ["Whisky", ["Destilados", "Whisky"]],
  ["Gin", ["Destilados", "Gin"]],
  ["Vodka", ["Destilados", "Vodka"]],
  ["Ron", ["Destilados", "Ron"]],
  ["Tequila", ["Destilados", "Tequila"]],
  ["Licores", ["Destilados", "Licores"]],
  ["Licor de Hierbas", ["Destilados", "Licores"]],
  ["Pisco", ["Destilados", "Pisco"]],
  ["Coñac", ["Destilados", "Coñac"]],
  ["Grapas", ["Destilados", "Grapas"]],
  ["Aperitivos", ["Aperitivos y coctelería", "Aperitivos"]],
  ["Vermouth", ["Aperitivos y coctelería", "Vermouth"]],
  ["Botánicos", ["Aperitivos y coctelería", "Botánicos"]],
  ["Pulpas", ["Aperitivos y coctelería", "Pulpas"]],
  ["Hielo", ["Aperitivos y coctelería", "Hielo"]],
  ["Copas y Utensilios", ["Aperitivos y coctelería", "Copas y utensilios"]],
  ["Copas y utensilios", ["Aperitivos y coctelería", "Copas y utensilios"]],
  ["Gaseosas", ["Sin alcohol", "Gaseosas"]],
  ["Aguas", ["Sin alcohol", "Aguas"]],
  ["Agua Saborizada", ["Sin alcohol", "Agua saborizada"]],
  ["Agua saborizada", ["Sin alcohol", "Agua saborizada"]],
  ["Jugos", ["Sin alcohol", "Jugos"]],
  ["Energizantes", ["Sin alcohol", "Energizantes"]],
  ["Sin alcohol", ["Sin alcohol", "Sin alcohol"]],
  ["Snacks", ["Snacks y almacén", "Snacks"]],
  ["Alfajores", ["Snacks y almacén", "Alfajores"]],
  ["Chocolates", ["Snacks y almacén", "Chocolates"]],
  ["Chicles y Golosinas", ["Snacks y almacén", "Golosinas"]],
  ["Golosinas", ["Snacks y almacén", "Golosinas"]],
  ["Conservas", ["Snacks y almacén", "Conservas"]],
  ["Mermeladas", ["Snacks y almacén", "Mermeladas"]],
  ["Aceite de Oliva", ["Snacks y almacén", "Aceite de oliva"]],
  ["Aceite de oliva", ["Snacks y almacén", "Aceite de oliva"]],
  ["Estuchería y Regalos", ["Regalos y varios", "Estuchería y regalos"]],
  ["Estuchería y regalos", ["Regalos y varios", "Estuchería y regalos"]],
  ["Artículos para Fumar", ["Regalos y varios", "Artículos para fumar"]],
  ["Artículos para fumar", ["Regalos y varios", "Artículos para fumar"]],
  ["Preservativos", ["Regalos y varios", "Preservativos"]],
  ["Varios", ["Regalos y varios", "Varios"]],
]);

const PROTECTED_CATEGORY_OVERRIDES = new Set([
  "Combos y Promociones",
  "Combos",
  "Estuchería y Regalos",
  "Bebidas Alcohólicas Gasificadas",
]);

const KEYWORD_OVERRIDES: Array<[string, [string, string]]> = [
  ["vermouth", ["Aperitivos y coctelería", "Vermouth"]],
  ["fernet", ["Aperitivos y coctelería", "Aperitivos"]],
  ["campari", ["Aperitivos y coctelería", "Aperitivos"]],
  ["aperol", ["Aperitivos y coctelería", "Aperitivos"]],
  ["cynar", ["Aperitivos y coctelería", "Aperitivos"]],
  ["gancia", ["Aperitivos y coctelería", "Aperitivos"]],
  ["martini", ["Aperitivos y coctelería", "Vermouth"]],
  ["cinzano", ["Aperitivos y coctelería", "Vermouth"]],
];

function cleanCell(value: unknown): string {
  return String(value ?? "").trim();
}

function normalize(value: unknown): string {
  return cleanCell(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseSubcategories(value: unknown): string[] {
  return cleanCell(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHelperRow(category: string): boolean {
  const normalized = normalize(category);
  return (
    !normalized ||
    normalized === "categoria" ||
    normalized === "categorias" ||
    normalized.includes("categorias principales")
  );
}

export function classifyProductCategory(
  productName: string,
  originalCategory: string,
): { category: string; subcategory?: string } {
  const category = cleanCell(originalCategory);
  if (!category) return { category: "", subcategory: undefined };

  if (MAIN_CATEGORY_NAMES.has(category) && category !== "Combos") {
    return { category, subcategory: undefined };
  }

  if (PROTECTED_CATEGORY_OVERRIDES.has(category)) {
    const [mappedCategory, subcategory] = BASE_CATEGORY_MAP.get(category) ?? [
      category,
      "",
    ];
    return { category: mappedCategory, subcategory };
  }

  const normalizedName = normalize(productName);
  for (const [keyword, [mappedCategory, subcategory]] of KEYWORD_OVERRIDES) {
    if (normalizedName.includes(keyword)) {
      return { category: mappedCategory, subcategory };
    }
  }

  const mapped = BASE_CATEGORY_MAP.get(category);
  if (mapped) {
    const [mappedCategory, subcategory] = mapped;
    return { category: mappedCategory, subcategory };
  }

  return { category: "Regalos y varios", subcategory: "Varios" };
}

export function parseCategoryGroups(rows: unknown[][]): CategoryGroup[] {
  if (rows.length === 0) return [];

  const firstRow = rows[0] ?? [];
  const hasStructuredHeaders = firstRow.some(
    (cell) => normalize(cell) === "subcategorias",
  );

  if (!hasStructuredHeaders) {
    return DEFAULT_CATEGORY_GROUPS;
  }

  return rows
    .slice(hasStructuredHeaders ? 1 : 0)
    .map((row) => {
      const category = cleanCell(row[0]);
      return {
        category,
        subcategories: hasStructuredHeaders ? parseSubcategories(row[1]) : [],
        note: hasStructuredHeaders ? cleanCell(row[2]) : "",
      };
    })
    .filter((group) => !isHelperRow(group.category));
}
