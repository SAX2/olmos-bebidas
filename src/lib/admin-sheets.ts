import "server-only";
import { google } from "googleapis";
import { imageCellForSku, quotedProductSheet, readAdminProducts } from "@/lib/product-sheet";

function client() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !key || !spreadsheetId) throw new Error("Falta configurar la planilla de productos.");
  const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
}

async function readRows() {
  const { sheets, spreadsheetId } = client();
  const range = process.env.GOOGLE_SHEET_RANGE ?? "Productos";
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId, range: quotedProductSheet(range), valueRenderOption: "UNFORMATTED_VALUE",
  }, { timeout: 15000 });
  return { sheets, spreadsheetId, range, rows: response.data.values ?? [] };
}

export async function getAdminProducts() {
  const { rows } = await readRows();
  return readAdminProducts(rows);
}

export async function assertUploadProduct(sku: string) {
  const { rows, range } = await readRows();
  imageCellForSku(rows, sku, range);
}

export async function saveProductImage(sku: string, imagen: string) {
  // Always resolve the SKU again: the owner may have reordered Sheets while uploading.
  const { sheets, spreadsheetId, range, rows } = await readRows();
  const cell = imageCellForSku(rows, sku, range);
  await sheets.spreadsheets.values.update({
    spreadsheetId, range: cell, valueInputOption: "RAW", requestBody: { values: [[imagen]] },
  }, { timeout: 15000 });
}
