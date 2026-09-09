import { requireAdmin } from "@/auth";
import { assertUploadProduct } from "@/lib/admin-sheets";
import { signWidgetParams } from "@/lib/cloudinary";
import { assertCloudinaryPreset, cloudinaryConfig } from "@/lib/cloudinary-server";

export async function POST(request: Request) {
  try { await requireAdmin(); } catch {
    return Response.json({ error: "Ingresá con una cuenta autorizada." }, { status: 401 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }
  try {
    const text = await request.text();
    if (text.length > 8192) return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
    const body = JSON.parse(text);
    const config = cloudinaryConfig();
    // Validate before touching external services; never provide a general signing endpoint.
    const signature = signWidgetParams(body.sku, body.params, config.apiSecret);
    await Promise.all([assertUploadProduct(body.sku), assertCloudinaryPreset(config.cloudName)]);
    return Response.json({ signature }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo preparar la carga.";
    // Do not return raw provider errors, which may include request configuration.
    const safe = /^(SKU |Carga |Los parámetros |El producto |El SKU |La planilla |GOOGLE_SHEET_RANGE |Falta configurar |Configuración de imágenes)/.test(message);
    return Response.json({ error: safe ? message : "No se pudo preparar la carga. Revisá la conexión e intentá de nuevo." }, { status: 400 });
  }
}
