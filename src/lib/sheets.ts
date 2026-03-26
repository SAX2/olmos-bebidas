import { unstable_cache } from "next/cache";
import { google } from "googleapis";
import type { Product } from "@/types/product";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

async function fetchProducts(): Promise<Product[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return [];
  }

  const parseSiNo = (value: unknown): boolean =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase() === "si";

  const parseNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    return Number(String(value).replace(/[$.\s]/g, "").replace(",", ".")) || 0;
  };

  const parseStock = (value: unknown, fallback = 10): number => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : fallback;
  };

  const parseDriveImage = (value: unknown): string => {
    const url = String(value ?? "").trim();
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
    return url;
  };

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.GOOGLE_SHEET_RANGE ?? "Productos",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 2) return [];

    return rows
      .slice(2)
      .filter((row) => row.length >= 3)
      .map((row) => ({
        nombre: String(row[0] ?? "").trim(),
        precio: parseNumber(row[1]),
        visibilidad: parseSiNo(row[2]),
        imagen: parseDriveImage(row[3]),
        categoria: String(row[4] ?? "").trim(),
        cantidadMaxima: parseStock(row[5]),
        descuentoTipo:
          String(row[6] ?? "").trim().toLowerCase() === "monto"
            ? ("monto" as const)
            : Number(row[7]) > 0
              ? ("porcentaje" as const)
              : undefined,
        descuento: Number(row[7]) || undefined,
        destacado: parseSiNo(row[8]),
      }))
      .filter((p) => p.nombre && p.precio > 0 && p.visibilidad);
  } catch (error) {
    console.error("Error fetching products from Google Sheets:", error);
    return [];
  }
}

export const getProducts = unstable_cache(fetchProducts, ["products"], {
  revalidate: 300,
});

async function fetchPromoDestacada(): Promise<string | null> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return null;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Promo destacada!A2",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const value = response.data.values?.[0]?.[0];
    return value ? String(value) : null;
  } catch (error) {
    console.error("Error fetching promo destacada from Google Sheets:", error);
    return null;
  }
}

export const getPromoDestacada = unstable_cache(fetchPromoDestacada, ["promo-destacada"], {
  revalidate: 300,
});

async function fetchCategories(): Promise<string[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Categorias!A:A",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows.map((row) => String(row[0] ?? "")).filter(Boolean);
  } catch (error) {
    console.error("Error fetching categories from Google Sheets:", error);
    return [];
  }
}

export const getCategories = unstable_cache(fetchCategories, ["categories"], {
  revalidate: 300,
});
