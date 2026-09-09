# Portal de imágenes

El dueño entra a `/admin`, busca un producto y sube o reemplaza su foto. Los productos, precios y stock siguen en Google Sheets. No se agrega una base de datos.

## Configuración

1. Usar Node.js 22.18 o superior e instalar dependencias con `npm ci`.
2. Completar las variables de `.env.example` en `.env.local`. No subir secretos a Git.
3. En Google Cloud, crear un cliente OAuth de tipo **Aplicación web**, con permisos de identidad básicos (`openid`, email y perfil). Registrar los callbacks exactos:
   - Local: `http://localhost:3000/api/auth/callback/google`.
   - Producción: `https://www.olmosbebidas.com.ar/api/auth/callback/google`.
   - Si se usa el dominio sin www, agregar también `https://olmosbebidas.com.ar/api/auth/callback/google`.
4. Guardar el ID y secreto del cliente en `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET`. Usar un secreto aleatorio para `AUTH_SECRET` (por ejemplo, `openssl rand -base64 32`).
5. Definir `ADMIN_EMAILS` con los correos autorizados, separados por comas. Google debe verificar el correo. Si la aplicación OAuth está en pruebas, agregar esos correos como usuarios de prueba en Google.
6. Compartir la planilla como **Editor** con `GOOGLE_SERVICE_ACCOUNT_EMAIL`. Habilitar Google Sheets API en su proyecto. La tienda conserva su acceso de lectura; el portal usa un cliente con alcance de escritura.
7. Usar una cuenta **Cloudinary Free** y completar `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.
8. Ejecutar `npm run setup:images`. Comprueba que la cuenta sea Free y crea el preset firmado `olmos_product_images_v1`. Para verificar sin modificar: `npm run setup:images -- --check`. Si se necesita restaurar únicamente este preset: `npm run setup:images -- --repair`.
9. Agregar las mismas variables al hosting y volver a desplegar. Visitar `/admin` e ingresar con una cuenta permitida.

El portal muestra un aviso de configuración pendiente si faltan las credenciales OAuth, y no permite obtener firmas sin una sesión autorizada. La API key y el cloud name de Cloudinary son identificadores públicos; el API secret y los secretos OAuth permanecen en el servidor.

## Uso

- Buscar por nombre o SKU. El listado incluye productos ocultos y sin precio.
- Elegir **Subir imagen** o **Reemplazar imagen**. Se admiten archivo, dirección web pública y cámara. La cámara depende del navegador y necesita HTTPS; en celulares se accede normalmente desde la selección de archivo.
- Admitir JPG, PNG o WebP de hasta 5 MB (5 × 1024 × 1024 bytes). El preset rechaza archivos mayores en Cloudinary mediante `eval`; no depende únicamente del control del navegador. Las fotos se convierten a WebP de hasta 1200 × 1200 px sin deformarse ni exigir recorte.
- Una vez guardada, se actualiza únicamente la celda **Imagen** del SKU seleccionado. El catálogo se refresca en la siguiente visita o recarga; una pestaña pública ya abierta no se actualiza sola.
- Si aparece **Reintentar guardado**, la foto ya se subió. Reintentar escribe su enlace en Sheets sin volver a cargar el archivo. No cerrar ni recargar el portal si se quiere conservar ese reintento. **Volver a subir** permite reemplazar el comprobante pendiente.
- Corregir SKU vacíos o duplicados directamente en Sheets. No se permite cargar fotos hasta resolverlos.

Los encabezados `SKU`, `Producto` e `Imagen` deben existir una única vez en la primera fila. Los datos empiezan en la fila 3. `GOOGLE_SHEET_RANGE` debe ser el nombre de la pestaña (recomendado: `Productos`) o un rango que comience en A1. El portal lee la pestaña completa y vuelve a localizar el SKU al guardar. Evitar reordenar filas durante el instante de guardado: Sheets no ofrece una escritura condicional por SKU.

## Cuotas y costos

No se contratan planes, add-ons ni funciones de IA. El preset desactiva los backups, reemplaza el activo del mismo SKU y no genera variantes adicionales de forma anticipada. La subida va directamente a Cloudinary; el sitio conserva su optimizador `wsrv.nl`.

Cloudinary Free tiene una cuota compartida entre almacenamiento, transformaciones y tráfico. Revisar su consumo desde el panel de Cloudinary. Agotar la cuota puede impedir nuevas cargas o afectar el servicio: el portal muestra el error y no cambia de plan automáticamente. El hosting del sitio y Google Sheets mantienen sus propios límites de uso. Esto evita nuevos servicios pagos, no garantiza consumo cero ni disponibilidad ilimitada.

## Verificación

```sh
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Para probar solo la interfaz con servicios simulados, sin iniciar sesión ni escribir en servicios reales:

```sh
npx playwright test --config=playwright.admin.config.ts
```

Los fixtures están únicamente en las pruebas; no hay rutas de acceso de prueba en la aplicación. Antes de publicar, comprobar manualmente una cuenta autorizada y una rechazada, subir/reemplazar una foto y verificar el catálogo. Las pruebas automáticas no sustituyen la configuración del OAuth ni el permiso Editor real de la planilla.
