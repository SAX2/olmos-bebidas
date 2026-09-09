import { createHash, timingSafeEqual } from "node:crypto";

export const UPLOAD_PRESET = "olmos_product_images_v1";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_SIZE_CHECK = "if (resource_info.bytes > 5242880) { throw new Error('La imagen supera 5 MB'); }";

export function productPublicId(sku: string): string {
  if (typeof sku !== "string" || !sku.trim() || sku.length > 500) throw new Error("SKU inválido.");
  return `olmos/productos/${createHash("sha256").update(sku.trim()).digest("hex")}`;
}

function signature(params: Record<string, string | number>, secret: string): string {
  if (!secret) throw new Error("Falta configurar Cloudinary.");
  const value = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(value + secret).digest("hex");
}

export function signWidgetParams(sku: string, value: unknown, secret: string, now = Math.floor(Date.now() / 1000)): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Carga inválida.");
  const params = value as Record<string, unknown>;
  const allowed = new Set(["timestamp", "public_id", "upload_preset", "source"]);
  const timestamp = Number(params.timestamp);
  if (Object.keys(params).some(key => !allowed.has(key)) ||
      params.public_id !== productPublicId(sku) || params.upload_preset !== UPLOAD_PRESET ||
      !Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 300 ||
      (params.source !== undefined && params.source !== "uw")) {
    throw new Error("Los parámetros de carga no están permitidos. Volvé a abrir el cargador.");
  }
  const validated: Record<string, string | number> = { public_id: productPublicId(sku), upload_preset: UPLOAD_PRESET, timestamp };
  if (params.source === "uw") validated.source = "uw";
  return signature(validated, secret);
}

export function verifyUpload(sku: string, value: unknown, secret: string, cloudName: string): string {
  if (!value || typeof value !== "object") throw new Error("Comprobante de carga inválido.");
  const receipt = value as Record<string, unknown>;
  if (receipt.public_id !== productPublicId(sku) || typeof receipt.version !== "number" ||
      !Number.isSafeInteger(receipt.version) || receipt.version <= 0 ||
      typeof receipt.signature !== "string" || !/^[a-f0-9]{40}$/.test(receipt.signature) ||
      !/^[a-z0-9_-]+$/i.test(cloudName)) throw new Error("Comprobante de carga inválido.");
  const expected = signature({ public_id: receipt.public_id, version: receipt.version }, secret);
  if (!timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(receipt.signature, "hex"))) {
    throw new Error("No se pudo verificar la imagen. Volvé a subirla.");
  }
  // The signed preset converts every accepted input to WebP. Never trust secure_url or format from the browser.
  return `https://res.cloudinary.com/${cloudName}/image/upload/v${receipt.version}/${receipt.public_id}.webp`;
}

export const PRESET_OPTIONS = {
  allowed_formats: ["jpg", "png", "webp"],
  eval: UPLOAD_SIZE_CHECK,
  transformation: [{ crop: "limit", width: 1200, height: 1200, fetch_format: "webp", quality: 80 }],
  overwrite: true,
  backup: false,
};

export function validatePreset(value: unknown): void {
  const fail = () => { throw new Error("Configuración de imágenes pendiente. Ejecutá npm run setup:images."); };
  if (!value || typeof value !== "object") return fail();
  const preset = value as { name?: string; unsigned?: boolean; settings?: Record<string, unknown>; options?: Record<string, unknown> };
  const opts = preset.settings ?? preset.options;
  if (preset.name !== UPLOAD_PRESET || preset.unsigned !== false || !opts) return fail();
  // Fail closed if extra processing (including paid add-ons) is configured.
  if (Object.keys(opts).some(key => !(key in PRESET_OPTIONS))) return fail();
  if (opts.eval !== UPLOAD_SIZE_CHECK || opts.overwrite !== true || opts.backup !== false) return fail();
  if (!Array.isArray(opts.allowed_formats) || [...opts.allowed_formats].sort().join(",") !== "jpg,png,webp") return fail();
  if (!Array.isArray(opts.transformation) || opts.transformation.length !== 1) return fail();
  const t = opts.transformation[0];
  if (!t || typeof t !== "object" || Object.keys(t).length !== 5 ||
      t.crop !== "limit" || Number(t.width) !== 1200 || Number(t.height) !== 1200 ||
      (t.format ?? t.fetch_format) !== "webp" || Number(t.quality) !== 80) return fail();
}
