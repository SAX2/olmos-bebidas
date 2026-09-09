import { createRoot } from "react-dom/client";
import { AdminProductManager } from "../../src/components/admin/admin-product-manager";
import type { WidgetOptions, WidgetResult } from "../../src/components/admin/cloudinary-widget";

declare global {
  interface Window {
    portalTest: {
      emit: (event: string, info?: WidgetResult["info"]) => void;
      fail: (message: string) => void;
      options?: WidgetOptions;
      saves: number;
      rejectSave: boolean;
      reordered?: boolean;
      reorder?: () => void;
    };
  }
}

window.portalTest = { emit: () => {}, fail: () => {}, saves: 0, rejectSave: false };
// Only the external widget and remote persistence are replaced. The real UI is rendered.
window.cloudinary = {
  createUploadWidget(options, callback) {
    window.portalTest.options = options;
    window.portalTest.emit = (event, info) => callback(null, { event, info });
    window.portalTest.fail = message => callback({ message });
    return { open() {}, close() { callback(null, { event: "close" }); }, destroy() {} };
  },
};

const root = createRoot(document.getElementById("root")!);
function render() { root.render(
  <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
    <header><p className="text-sm text-muted-foreground">Olmos Bebidas</p><h1 className="text-2xl font-semibold">Imágenes de productos</h1></header>
    <AdminProductManager cloudName="demo" apiKey="public-test-key" uploadPreset="olmos_product_images_v1"
      products={([
        { row: 3, sku: "GIN-1", nombre: "Gin de prueba", imagen: "", issue: null, publicId: "test/gin" },
        { row: 4, sku: "VINO-2", nombre: "Vino con un nombre muy largo para verificar que el listado se adapta a la pantalla del celular", imagen: "", issue: null, publicId: "test/vino" },
        { row: 5, sku: "DUP", nombre: "Producto duplicado", imagen: "", issue: "duplicate-sku", publicId: "" },
        { row: 6, sku: "", nombre: "Producto sin SKU", imagen: "", issue: "missing-sku", publicId: "" },
      ] as const).map((product, index) => ({ ...product, row: window.portalTest.reordered ? 6 - index : product.row }))}
      saveImage={async () => {
        window.portalTest.saves += 1;
        if (window.portalTest.rejectSave) return { ok: false, error: "No se pudo guardar en la planilla." };
        return { ok: true, imagen: "https://example.com/saved.webp" };
      }}
    />
  </main>,
);
}
window.portalTest.reorder = () => { window.portalTest.reordered = true; render(); };
render();
