import type { Product } from "@/types/product";

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

export function parseProductRow(row: unknown[]): Product | null {
  const sku = String(row[0] ?? "").trim();
  const nombre = String(row[1] ?? "").trim();
  const precio = parseNumber(row[2]);
  const visibilidad = parseSiNo(row[3]);
  const descuento = Number(row[8]) || undefined;

  const product: Product = {
    id: sku || nombre,
    sku,
    nombre,
    precio,
    visibilidad,
    imagen: parseDriveImage(row[4]),
    categoria: String(row[5] ?? "").trim(),
    cantidadMaxima: parseStock(row[6]),
    descuentoTipo:
      String(row[7] ?? "").trim().toLowerCase() === "monto"
        ? "monto"
        : descuento && descuento > 0
          ? "porcentaje"
          : undefined,
    descuento,
    destacado: parseSiNo(row[9]),
  };

  if (!product.nombre || product.precio <= 0 || !product.visibilidad) {
    return null;
  }

  return product;
}
