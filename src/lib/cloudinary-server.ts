import "server-only";
import { unstable_cache } from "next/cache";
import { UPLOAD_PRESET, validatePreset } from "@/lib/cloudinary";

export function cloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !/^[a-z0-9_-]+$/i.test(cloudName) || !apiKey || !apiSecret) {
    throw new Error("Falta configurar el servicio de imágenes.");
  }
  return { cloudName, apiKey, apiSecret };
}

export const assertCloudinaryPreset = unstable_cache(async (cloudName: string) => {
  const { apiKey, apiSecret } = cloudinaryConfig();
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${UPLOAD_PRESET}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}` },
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Configuración de imágenes pendiente. Ejecutá npm run setup:images.");
  validatePreset(await response.json());
  return true;
}, ["admin-cloudinary-preset-v1"], { revalidate: 300 });
