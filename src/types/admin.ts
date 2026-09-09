export interface AdminProduct {
  row: number;
  sku: string;
  nombre: string;
  imagen: string;
  issue: "missing-sku" | "duplicate-sku" | null;
}

export interface UploadReceipt {
  public_id: string;
  version: number;
  signature: string;
}

export type SaveImageResult = { ok: true; imagen: string } | { ok: false; error: string };
