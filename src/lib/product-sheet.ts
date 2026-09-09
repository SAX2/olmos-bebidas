import type { AdminProduct } from "../types/admin";

function normalize(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function columns(rows: unknown[][]) {
  const headers = (rows[0] ?? []).map(normalize);
  const find = (name: string) => {
    const index = headers.indexOf(name);
    if (index < 0 || headers.lastIndexOf(name) !== index) {
      throw new Error(`La planilla debe tener una única columna ${name}.`);
    }
    return index;
  };
  return { sku: find("sku"), nombre: find("producto"), imagen: find("imagen") };
}

export function readAdminProducts(rows: unknown[][]): AdminProduct[] {
  const cols = columns(rows);
  const counts = new Map<string, number>();
  for (const row of rows.slice(2)) {
    const sku = String(row[cols.sku] ?? "").trim();
    if (sku) counts.set(sku, (counts.get(sku) ?? 0) + 1);
  }
  return rows.slice(2).flatMap((row, index) => {
    const sku = String(row[cols.sku] ?? "").trim();
    const nombre = String(row[cols.nombre] ?? "").trim();
    if (!nombre) return [];
    return [{ row: index + 3, sku, nombre, imagen: String(row[cols.imagen] ?? "").trim(),
      issue: !sku ? "missing-sku" : (counts.get(sku) ?? 0) > 1 ? "duplicate-sku" : null }];
  });
}

// Administrative reads start at A1 so physical rows always match Sheets.
export function productSheetName(range: string): string {
  const match = range.match(/^(?:'((?:[^']|'')+)'|([^'!]+))(?:!(A(?::[A-Z]+)|A1(?::[A-Z]+[0-9]*)?))?$/i);
  if (!match) throw new Error("GOOGLE_SHEET_RANGE debe indicar una pestaña o un rango desde A1.");
  return (match[1]?.replace(/''/g, "'") ?? match[2]).trim();
}

export function quotedProductSheet(range: string): string {
  return `'${productSheetName(range).replace(/'/g, "''")}'`;
}

export function imageCellForSku(rows: unknown[][], sku: string, range: string): string {
  if (typeof sku !== "string" || !sku.trim()) throw new Error("El producto no tiene SKU.");
  const product = readAdminProducts(rows).find(item => item.sku === sku.trim());
  if (!product) throw new Error("El producto ya no existe. Actualizá el listado.");
  if (product.issue) throw new Error("El SKU está duplicado. Corregilo en la planilla.");
  let n = columns(rows).imagen + 1;
  let letter = "";
  while (n > 0) {
    n -= 1;
    letter = String.fromCharCode(65 + n % 26) + letter;
    n = Math.floor(n / 26);
  }
  return `${quotedProductSheet(range)}!${letter}${product.row}`;
}
