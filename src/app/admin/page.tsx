import { redirect } from "next/navigation";
import { requireAdmin, signOut } from "@/auth";
import { getAdminProducts } from "@/lib/admin-sheets";
import { cloudinaryConfig } from "@/lib/cloudinary-server";
import { productPublicId, UPLOAD_PRESET } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { AdminProductManager } from "@/components/admin/admin-product-manager";
import { saveImage } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdmin().catch(() => null);
  if (!session) redirect("/admin/login");
  let data = null;
  try {
    const config = cloudinaryConfig();
    const products = await getAdminProducts();
    data = { cloudName: config.cloudName, apiKey: config.apiKey, products: products.map(product => ({ ...product, publicId: product.sku && !product.issue ? productPublicId(product.sku) : "" })) };
  } catch {
    // Keep provider details and credentials out of the rendered error message.
  }
  return <>
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm text-muted-foreground">Olmos Bebidas</p>
        <h1 className="text-2xl font-semibold tracking-tight">Imágenes de productos</h1>
      </div>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
        <Button type="submit" variant="outline">Salir</Button>
      </form>
    </header>
    {data ? <AdminProductManager {...data} uploadPreset={UPLOAD_PRESET} saveImage={saveImage} /> :
      <p role="alert" className="rounded-lg border p-4 text-sm">No se pudo cargar el portal. Verificá la configuración de Cloudinary, las columnas SKU, Producto e Imagen y el acceso a la planilla; después recargá la página.</p>}
  </>;
}
