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
        nombre: String(row[0] ?? ""),
        precio: Number(row[1]) || 0,
        disponibilidad: String(row[2] ?? "").toLowerCase() === "si",
        imagen: String(row[3] ?? ""),
        categoria: String(row[4] ?? ""),
        cantidadMaxima: Number(row[5]) || 10,
        descuentoTipo:
          String(row[6] ?? "").toLowerCase() === "monto"
            ? ("monto" as const)
            : Number(row[7]) > 0
              ? ("porcentaje" as const)
              : undefined,
        descuento: Number(row[7]) || undefined,
        destacado: String(row[8] ?? "").toLowerCase() === "si",
      }))
      .filter((p) => p.nombre && p.precio > 0);
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
