"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/auth";
import { saveProductImage } from "@/lib/admin-sheets";
import { verifyUpload } from "@/lib/cloudinary";
import { cloudinaryConfig } from "@/lib/cloudinary-server";
import type { SaveImageResult } from "@/types/admin";

export async function saveImage(sku: string, receipt: unknown): Promise<SaveImageResult> {
  try { await requireAdmin(); } catch {
    return { ok: false, error: "Tu sesión venció. Volvé a ingresar con Google." };
  }
  let imagen: string;
  try {
    const config = cloudinaryConfig();
    imagen = verifyUpload(sku, receipt, config.apiSecret, config.cloudName);
  } catch {
    return { ok: false, error: "No se pudo verificar la imagen. Volvé a subirla." };
  }
  try {
    await saveProductImage(sku, imagen);
    updateTag("products");
    return { ok: true, imagen };
  } catch {
    return { ok: false, error: "La imagen se subió, pero no se pudo guardar en la planilla. Revisá el SKU y el permiso Editor; después reintentá el guardado." };
  }
}
