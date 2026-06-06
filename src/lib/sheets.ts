import { unstable_cache } from "next/cache";
import { google } from "googleapis";
import type { CategoryGroup, Product } from "@/types/product";
import { DEFAULT_CATEGORY_GROUPS, parseCategoryGroups } from "@/lib/category-groups";
import { parseProductRow } from "@/lib/product-row";

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

    const headers = rows[0] ?? [];

    return rows
      .slice(2)
      .map((row) => parseProductRow(row, headers))
      .filter((product): product is Product => product !== null);
  } catch (error) {
    console.error("Error fetching products from Google Sheets:", error);
    return [];
  }
}

export const getProducts = unstable_cache(fetchProducts, ["products-v3"], {
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

async function fetchCategoryGroups(): Promise<CategoryGroup[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return DEFAULT_CATEGORY_GROUPS;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Categorias!A:C",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows) return [];

    const categoryGroups = parseCategoryGroups(rows);
    return categoryGroups.length > 0 ? categoryGroups : DEFAULT_CATEGORY_GROUPS;
  } catch (error) {
    console.error("Error fetching categories from Google Sheets:", error);
    return DEFAULT_CATEGORY_GROUPS;
  }
}

export const getCategoryGroups = unstable_cache(fetchCategoryGroups, ["category-groups-v2"], {
  revalidate: 300,
});
