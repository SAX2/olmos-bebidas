"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadCloudinaryWidget, type UploadWidget } from "./cloudinary-widget";
import type { AdminProduct, SaveImageResult, UploadReceipt } from "@/types/admin";

type Product = AdminProduct & { publicId: string };
type RowState = { status: "idle" | "loading" | "uploading" | "saving" | "error" | "saved"; message?: string; receipt?: UploadReceipt; imagen?: string };
const productKey = (product: Product) => product.issue ? `row:${product.row}` : `sku:${product.sku}`;
interface Props {
  products: Product[];
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  saveImage: (sku: string, receipt: UploadReceipt) => Promise<SaveImageResult>;
}

function thumbnailUrl(url: string) {
  const drive = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return drive ? `https://lh3.googleusercontent.com/d/${drive[1]}` : url;
}

function Thumbnail({ src, nombre }: { src: string; nombre: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
    {src && /^https?:\/\//.test(src) && !failed ? <Image src={thumbnailUrl(src)} alt={nombre} width={64} height={64} sizes="64px" className="size-16 object-contain" onError={() => setFailed(true)} /> : <span className="px-1 text-center text-xs text-muted-foreground">Sin foto</span>}
  </div>;
}

export function AdminProductManager({ products, cloudName, apiKey, uploadPreset, saveImage }: Props) {
  const [search, setSearch] = useState("");
  const [states, setStates] = useState<Record<string, RowState>>({});
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const busy = useRef(false);
  const widget = useRef<UploadWidget | null>(null);
  const cancelActive = useRef<(() => void) | null>(null);
  useEffect(() => () => { cancelActive.current?.(); widget.current?.destroy(); }, []);

  function setRow(product: Product, next: RowState) {
    const key = productKey(product);
    setStates(previous => ({ ...previous, [key]: { ...previous[key], ...next } }));
  }
  function release() { busy.current = false; setActiveRow(null); }

  async function persist(product: Product, receipt: UploadReceipt) {
    setRow(product, { status: "saving", receipt, message: "Guardando en la planilla…" });
    try {
      const result = await saveImage(product.sku, receipt);
      if (!result.ok) { setRow(product, { status: "error", receipt, message: result.error }); return; }
      setRow(product, { status: "saved", receipt: undefined, imagen: result.imagen, message: "Imagen guardada" });
    } catch {
      setRow(product, { status: "error", receipt, message: "No se pudo confirmar el guardado. Reintentá sin volver a subir la imagen." });
    } finally { release(); }
  }

  async function upload(product: Product) {
    if (busy.current || product.issue) return;
    busy.current = true;
    setActiveRow(productKey(product));
    setRow(product, { status: "loading", message: "Abriendo cargador…", receipt: undefined });
    let finished = false;
    let currentWidget: UploadWidget | null = null;
    cancelActive.current = () => { finished = true; };
    try {
      const cloudinary = await loadCloudinaryWidget();
      if (finished) return;
      widget.current?.destroy();
      currentWidget = cloudinary.createUploadWidget({
        cloudName, apiKey, uploadPreset, publicId: product.publicId,
        sources: ["local", "url", "camera"], resourceType: "image", multiple: false, maxFiles: 1,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"], maxFileSize: 5 * 1024 * 1024,
        cropping: false, showAdvancedOptions: false, showUploadMoreButton: false, singleUploadAutoClose: true,
        cloudinaryAnalytics: false, language: "es",
        text: { es: { or: "o", back: "Volver", close: "Cerrar", menu: { files: "Archivos", web: "Dirección web", camera: "Cámara" }, local: { browse: "Seleccionar imagen", dd_title_single: "Arrastrá una imagen aquí" }, url: { input_placeholder: "https://…", upload: "Subir" }, queue: { title: "Subiendo imagen", done: "Listo" } } },
        uploadSignature: (callback, params) => {
          void (async () => {
            try {
              const response = await fetch("/api/admin/uploads/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku: product.sku, params }), signal: AbortSignal.timeout(30000) });
              const data = await response.json();
              if (finished) return;
              if (!response.ok || !data.signature) throw new Error(data.error || "No se pudo autorizar la carga.");
              callback(data.signature);
            } catch (error) {
              if (finished) return;
              finished = true;
              setRow(product, { status: "error", message: error instanceof Error ? error.message : "No se pudo autorizar la carga." });
              currentWidget?.close({ quiet: true });
              release();
            }
          })();
        },
      }, (error, result) => {
        if (finished) return;
        if (error) {
          finished = true;
          const quota = /quota|credit|limit|too large/i.test(error.message ?? "");
          setRow(product, { status: "error", message: quota ? "La carga superó un límite de tamaño o del plan gratuito. Revisá el archivo y la cuota de Cloudinary." : "No se pudo subir la imagen. Revisá el archivo y la conexión e intentá de nuevo." });
          currentWidget?.close({ quiet: true }); release(); return;
        }
        if (result?.event === "success") {
          finished = true;
          const info = result.info;
          if (!info?.public_id || !info.signature || typeof info.version !== "number") {
            setRow(product, { status: "error", message: "El servicio no devolvió un comprobante válido. Volvé a subir la imagen." }); release(); return;
          }
          void persist(product, { public_id: info.public_id, version: info.version, signature: info.signature });
        } else if (result?.event === "queues-start") {
          setRow(product, { status: "uploading", message: "Subiendo imagen…" });
        } else if (result?.event === "close" || result?.event === "abort") {
          finished = true; setRow(product, { status: "idle", message: "Carga cancelada" }); release();
        }
      });
      widget.current = currentWidget;
      currentWidget.open();
      setRow(product, { status: "loading", message: "Seleccioná una imagen en el cargador" });
    } catch (error) {
      if (finished) return;
      finished = true;
      setRow(product, { status: "error", message: error instanceof Error ? error.message : "No se pudo abrir el cargador." }); release();
    }
  }

  const query = search.trim().toLocaleLowerCase("es-AR");
  const visible = products.filter(product => `${product.nombre} ${product.sku}`.toLocaleLowerCase("es-AR").includes(query));
  return <section className="flex flex-col gap-4" aria-label="Administrar imágenes">
    <p className="text-sm text-muted-foreground">Buscá un producto y agregá su foto. JPG, PNG o WebP, hasta 5 MB.</p>
    <label className="flex flex-col gap-2 text-sm font-medium">
      Buscar producto
      <Input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre o SKU…" className="h-11" />
    </label>
    <p className="text-xs text-muted-foreground" role="status">{visible.length} de {products.length} productos</p>
    {visible.length ? <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {visible.map(product => {
        const key = productKey(product);
        const state = states[key];
        const imagen = state?.imagen ?? product.imagen;
        const issue = product.issue === "missing-sku" ? "Sin SKU: completalo en la planilla" : product.issue === "duplicate-sku" ? "SKU duplicado: corregilo en la planilla" : null;
        return <li key={key} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4" aria-label={product.nombre}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Thumbnail key={imagen} src={imagen} nombre={product.nombre} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="break-words text-sm font-medium [overflow-wrap:anywhere]">{product.nombre}</h2>
              <p className="break-all text-xs text-muted-foreground">SKU: {product.sku || "Sin asignar"}</p>
              <p className="text-xs text-muted-foreground">{issue || (imagen ? "Con imagen" : "Sin imagen")}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:w-56 sm:shrink-0 sm:items-end">
            {state?.message ? <p role={state.status === "error" ? "alert" : "status"} className="break-words text-sm sm:text-right">{state.message}</p> : null}
            <Button variant={imagen ? "outline" : "default"} disabled={Boolean(issue) || activeRow !== null} className="w-full sm:w-auto"
              onClick={() => {
                if (state?.receipt) { if (busy.current) return; busy.current = true; setActiveRow(key); void persist(product, state.receipt); }
                else void upload(product);
              }}>
              {activeRow === key ? "Procesando…" : state?.receipt ? "Reintentar guardado" : imagen ? "Reemplazar imagen" : "Subir imagen"}
            </Button>
            {state?.receipt && activeRow === null ? <Button variant="ghost" onClick={() => void upload(product)}>Volver a subir</Button> : null}
          </div>
        </li>;
      })}
    </ul> : <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">{products.length ? "No hay productos que coincidan con la búsqueda." : "Todavía no hay productos con nombre en la planilla."}</p>}
  </section>;
}
