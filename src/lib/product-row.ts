import type { Product } from "@/types/product";

const DEFAULT_COLUMNS = {
  sku: 0,
  nombre: 1,
  precio: 2,
  visibilidad: 3,
  imagen: 4,
  categoria: 5,
  cantidadMaxima: 6,
  descuentoTipo: 7,
  descuento: 8,
  destacado: 9,
} as const;

const MAIN_CATEGORY_NAMES = new Set([
  "Vinos y espumantes",
  "Cervezas",
  "Destilados",
  "Aperitivos y coctelería",
  "Sin alcohol",
  "Snacks y almacén",
  "Regalos y varios",
]);

const BASE_CATEGORY_MAP = new Map<string, [string, string]>([
  ["Combos y Promociones", ["Combos", "Combos"]],
  ["Combos", ["Combos", "Combos"]],
  ["Vinos", ["Vinos y espumantes", "Vinos"]],
  ["Espumantes", ["Vinos y espumantes", "Espumantes"]],
  ["Champagne", ["Vinos y espumantes", "Champagne"]],
  ["Cervezas", ["Cervezas", "Cervezas"]],
  ["Bebidas Alcohólicas Gasificadas", ["Cervezas", "Listas para tomar"]],
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
  ["Gaseosas", ["Sin alcohol", "Gaseosas"]],
  ["Aguas", ["Sin alcohol", "Aguas"]],
  ["Agua Saborizada", ["Sin alcohol", "Agua saborizada"]],
  ["Jugos", ["Sin alcohol", "Jugos"]],
  ["Energizantes", ["Sin alcohol", "Energizantes"]],
  ["Sin alcohol", ["Sin alcohol", "Sin alcohol"]],
  ["Snacks", ["Snacks y almacén", "Snacks"]],
  ["Alfajores", ["Snacks y almacén", "Alfajores"]],
  ["Chocolates", ["Snacks y almacén", "Chocolates"]],
  ["Chicles y Golosinas", ["Snacks y almacén", "Golosinas"]],
  ["Conservas", ["Snacks y almacén", "Conservas"]],
  ["Mermeladas", ["Snacks y almacén", "Mermeladas"]],
  ["Aceite de Oliva", ["Snacks y almacén", "Aceite de oliva"]],
  ["Estuchería y Regalos", ["Regalos y varios", "Estuchería y regalos"]],
  ["Artículos para Fumar", ["Regalos y varios", "Artículos para fumar"]],
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

function parseSiNo(value: unknown): boolean {
  return (
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase() === "si"
  );
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  return Number(String(value).replace(/[$.\s]/g, "").replace(",", ".")) || 0;
}

function parseStock(value: unknown, fallback = 10): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function parseDriveImage(value: unknown): string {
  const url = String(value ?? "").trim();
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
}

function classifyProductCategory(
  productName: string,
  originalCategory: string,
): { category: string; subcategory?: string } {
  const category = String(originalCategory ?? "").trim();
  if (!category) return { category: "", subcategory: undefined };

  if (MAIN_CATEGORY_NAMES.has(category)) {
    return { category, subcategory: undefined };
  }

  if (PROTECTED_CATEGORY_OVERRIDES.has(category)) {
    const [mappedCategory, subcategory] = BASE_CATEGORY_MAP.get(category) ?? [
      category,
      "",
    ];
    return { category: mappedCategory, subcategory };
  }

  const normalizedName = normalizeHeader(productName);
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

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function createColumnLookup(headers?: unknown[]): Map<string, number> {
  const lookup = new Map<string, number>();
  headers?.forEach((header, index) => {
    const key = normalizeHeader(header);
    if (key) lookup.set(key, index);
  });
  return lookup;
}

function readColumn(
  row: unknown[],
  headers: Map<string, number>,
  names: string[],
  fallbackIndex?: number,
): unknown {
  for (const name of names) {
    const index = headers.get(normalizeHeader(name));
    if (index !== undefined) return row[index];
  }

  return fallbackIndex === undefined ? undefined : row[fallbackIndex];
}

export function parseProductRow(row: unknown[], headers?: unknown[]): Product | null {
  const columnLookup = createColumnLookup(headers);
  const sku = String(
    readColumn(row, columnLookup, ["SKU"], DEFAULT_COLUMNS.sku) ?? "",
  ).trim();
  const nombre = String(
    readColumn(row, columnLookup, ["Producto"], DEFAULT_COLUMNS.nombre) ?? "",
  ).trim();
  const precio = parseNumber(
    readColumn(row, columnLookup, ["Precio"], DEFAULT_COLUMNS.precio),
  );
  const visibilidad = parseSiNo(
    readColumn(row, columnLookup, ["Visibilidad"], DEFAULT_COLUMNS.visibilidad),
  );
  const rawDescuento = readColumn(
    row,
    columnLookup,
    ["Descuento"],
    DEFAULT_COLUMNS.descuento,
  );
  const descuento = Number(rawDescuento) || undefined;
  let categoria = String(
    readColumn(row, columnLookup, ["Categoria", "Categoría"], DEFAULT_COLUMNS.categoria) ?? "",
  ).trim();
  let subcategoria = String(
    readColumn(row, columnLookup, ["Subcategoria", "Subcategoría"]) ?? "",
  ).trim();
  const descuentoTipo = String(
    readColumn(row, columnLookup, ["Tipo Descuento"], DEFAULT_COLUMNS.descuentoTipo) ?? "",
  )
    .trim()
    .toLowerCase();

  if (!subcategoria) {
    const classified = classifyProductCategory(nombre, categoria);
    categoria = classified.category;
    subcategoria = classified.subcategory ?? "";
  }

  const product: Product = {
    id: sku || nombre,
    sku,
    nombre,
    precio,
    visibilidad,
    imagen: parseDriveImage(
      readColumn(row, columnLookup, ["Imagen"], DEFAULT_COLUMNS.imagen),
    ),
    categoria,
    cantidadMaxima: parseStock(
      readColumn(row, columnLookup, ["Stock"], DEFAULT_COLUMNS.cantidadMaxima),
    ),
    descuentoTipo:
      descuentoTipo === "monto"
        ? "monto"
        : descuento && descuento > 0
          ? "porcentaje"
          : undefined,
    descuento,
    destacado: parseSiNo(
      readColumn(row, columnLookup, ["Destacado"], DEFAULT_COLUMNS.destacado),
    ),
  };

  if (subcategoria) {
    product.subcategoria = subcategoria;
  }

  if (!product.nombre || product.precio <= 0 || !product.visibilidad) {
    return null;
  }

  return product;
}
