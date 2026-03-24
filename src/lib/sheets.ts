"use server"

import { google } from "googleapis";
import type { Product } from "@/types/product";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function getProducts(): Promise<Product[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.GOOGLE_SHEET_RANGE ?? "Hoja1",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((row) => row.length >= 3)
      .map((row) => ({
        nombre: String(row[0] ?? ""),
        precio: Number(row[1]) || 0,
        disponibilidad: String(row[2] ?? "").toLowerCase() === "si",
        imagen: String(row[3] ?? ""),
        categoria: String(row[4] ?? ""),
        cantidadMaxima: Number(row[5]) || 10,
        descuento: Number(row[6]) || undefined,
        descuentoTipo:
          String(row[7] ?? "").toLowerCase() === "monto"
            ? ("monto" as const)
            : Number(row[6]) > 0
              ? ("porcentaje" as const)
              : undefined,
      }))
      .filter((p) => p.nombre && p.precio > 0);
  } catch (error) {
    console.error("Error fetching products from Google Sheets:", error);
    return [];
  }
}
