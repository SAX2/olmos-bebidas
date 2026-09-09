import { UPLOAD_PRESET, UPLOAD_SIZE_CHECK, validatePreset } from "../src/lib/cloudinary.ts";

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !/^[a-z0-9_-]+$/i.test(cloud) || !key || !secret) {
  console.error("Faltan las variables de Cloudinary en .env.local.");
  process.exit(1);
}
const headers = { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` };
const base = `https://api.cloudinary.com/v1_1/${cloud}`;
async function request(path, init = {}) {
  return fetch(`${base}/${path}`, { ...init, headers: { ...headers, ...init.headers }, signal: AbortSignal.timeout(20000) });
}
try {
  const usageResponse = await request("usage");
  if (!usageResponse.ok) throw new Error("No se pudo verificar el plan de Cloudinary. Revisá las credenciales.");
  const usage = await usageResponse.json();
  if (String(usage.plan).toLowerCase() !== "free") throw new Error("Esta configuración requiere una cuenta Cloudinary Free. No se modificó el plan.");
  console.log("Cloudinary: plan Free verificado. No se activan servicios pagos.");
  let response = await request(`upload_presets/${UPLOAD_PRESET}`);
  if ((response.status === 404 || process.argv.includes("--repair")) && !process.argv.includes("--check")) {
    const body = new URLSearchParams({
      name: UPLOAD_PRESET, unsigned: "false", allowed_formats: "jpg,png,webp",
      eval: UPLOAD_SIZE_CHECK, transformation: "c_limit,w_1200,h_1200,f_webp,q_80",
      overwrite: "true", backup: "false",
    });
    const created = await request(response.status === 404 ? "upload_presets" : `upload_presets/${UPLOAD_PRESET}`, { method: response.status === 404 ? "POST" : "PUT", body });
    if (!created.ok) throw new Error("No se pudo crear la configuración de carga firmada.");
    console.log(`Configuración ${UPLOAD_PRESET} guardada.`);
    response = await request(`upload_presets/${UPLOAD_PRESET}`);
  }
  if (!response.ok) throw new Error("Falta crear la configuración: ejecutá npm run setup:images sin --check.");
  validatePreset(await response.json());
  console.log("Validado: carga firmada, hasta 5 MB, JPG/PNG/WebP, salida WebP de hasta 1200 px, sin add-ons ni backups.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "No se pudo configurar Cloudinary.");
  process.exitCode = 1;
}
