import type { UploadReceipt } from "@/types/admin";

export interface UploadWidget {
  open(): void;
  destroy(): void;
  close(options?: { quiet: boolean }): void;
}

export interface WidgetResult {
  event: string;
  info?: Partial<UploadReceipt>;
}

export interface WidgetOptions {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  publicId: string;
  sources: string[];
  resourceType: string;
  multiple: boolean;
  maxFiles: number;
  clientAllowedFormats: string[];
  maxFileSize: number;
  cropping: boolean;
  showAdvancedOptions: boolean;
  showUploadMoreButton: boolean;
  singleUploadAutoClose: boolean;
  cloudinaryAnalytics: boolean;
  language: string;
  text: Record<string, unknown>;
  uploadSignature: (callback: (signature: string) => void, params: Record<string, unknown>) => void;
}

interface CloudinaryWidgetAPI {
  createUploadWidget(options: WidgetOptions, callback: (error: { message?: string } | null, result?: WidgetResult) => void): UploadWidget;
}

declare global {
  interface Window { cloudinary?: CloudinaryWidgetAPI }
}

let scriptPromise: Promise<CloudinaryWidgetAPI> | undefined;

export function loadCloudinaryWidget(): Promise<CloudinaryWidgetAPI> {
  if (window.cloudinary) return Promise.resolve(window.cloudinary);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<CloudinaryWidgetAPI>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => { script.remove(); scriptPromise = undefined; reject(new Error("El cargador tardó demasiado. Intentá de nuevo.")); }, 20000);
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.cloudinary) resolve(window.cloudinary);
      else { scriptPromise = undefined; reject(new Error("No se pudo abrir el cargador.")); }
    };
    script.onerror = () => {
      clearTimeout(timer); script.remove(); scriptPromise = undefined;
      reject(new Error("No se pudo descargar el cargador. Revisá la conexión e intentá de nuevo."));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
