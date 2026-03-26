# Guia de uso - Planilla de productos

Esta guia explica como cargar y modificar los productos, categorias y promociones de la tienda desde Google Sheets. Los cambios que hagas en la planilla se reflejan en la pagina en un maximo de **5 minutos**.

---

## Pestana "Productos"

Es la tabla principal. Cada fila es un producto. **Los datos arrancan en la fila 3** (fila 1 = encabezados, fila 2 = subencabezados).

| Columna | Que poner | Obligatorio | Ejemplo |
|---------|-----------|:-----------:|---------|
| **Producto** | Nombre del producto | Si | `Coca-Cola 2.25L` |
| **Precio** | Precio en pesos (acepta `$`, `.` y `,`) | Si | `2500` o `$2.500` |
| **Visibilidad** | `si` o `no` — si pones `no`, el producto no aparece en la pagina | Si | `si` |
| **Imagen** | Link de la imagen (ver seccion "Imagenes") | No | `https://lh3.google...` |
| **Categoria** | Categoria del producto | No | `Gaseosas` |
| **Stock** | Cantidad maxima que un cliente puede pedir | No | `10` (si se deja vacio, se asume 10) |
| **Tipo Descuento** | `porcentaje` o `monto` | No | `porcentaje` |
| **Descuento** | Valor del descuento | No | `15` (= 15% OFF) o `500` (= -$500) |
| **Destacado** | `si` o `no` — aparece en la seccion "Promociones" | No | `si` |

### Reglas importantes

- Un producto **no aparece** en la pagina si no tiene nombre o si el precio es 0.
- Si pones **Visibilidad** en `no`, el producto **no aparece** en la pagina.
- Si pones **Stock** en `0`, el producto se muestra pero no se puede agregar al carrito (aparece como "Sin stock").
- Los productos con **Destacado** en `si` o con **Descuento** mayor a 0 aparecen en el filtro "Promociones".

### Descuentos

Hay dos tipos:

- **Porcentaje:** Poner `porcentaje` en "Tipo Descuento" y el numero en "Descuento". Ejemplo: `15` = 15% OFF.
- **Monto fijo:** Poner `monto` en "Tipo Descuento" y el valor a descontar en "Descuento". Ejemplo: `500` = se restan $500 al precio.

Si el descuento deja el precio en 0 o negativo, se ignora automaticamente.

---

## Pestana "Categorias"

Define el **orden** en que aparecen las categorias en la pagina.

- Escribir un nombre de categoria por fila en la **columna A**.
- El orden de las filas determina el orden en la pagina.
- Si un producto tiene una categoria que no esta en esta lista, aparece al final.
- Si una categoria de la lista no tiene productos, no se muestra.

### Ejemplo

| A |
|---|
| Gaseosas |
| Aguas |
| Cervezas |
| Vinos |

---

## Pestana "Promo destacada"

Muestra un **texto de aviso** que se desplaza en la parte superior de la pagina (tipo marquesina).

- Escribir el texto en la **celda A2**.
- Si la celda esta vacia, no se muestra ningun aviso.
- Ideal para anunciar promos especiales, horarios, envios, etc.

### Ejemplo

| A |
|---|
| *(encabezado, no tocar)* |
| Envio gratis en compras mayores a $15.000 - Promocion valida hasta fin de mes |

---

## Imagenes con Google Drive

Para agregar imagenes de los productos, podes usar Google Drive que ya tenes con tu cuenta de Google.

### Paso a paso

1. **Subir la imagen a Google Drive**
   - Abri [drive.google.com](https://drive.google.com)
   - Arrastra la imagen o usa el boton "Nuevo" > "Subir archivo"

2. **Compartir la imagen como publica**
   - Click derecho sobre la imagen > "Compartir"
   - En "Acceso general", cambiar a **"Cualquier persona con el enlace"**
   - Click en "Copiar enlace"

3. **Pegar el link en la planilla**
   - Pegar el enlace tal cual en la columna **Imagen**. La pagina lo convierte automaticamente.

### Tips para las imagenes

- Usar imagenes **cuadradas** o con fondo blanco/transparente para que se vean mejor.
- Formatos recomendados: JPG, PNG o WebP.
- No hace falta que sean muy grandes: 500x500 pixeles es suficiente.
- Si la imagen no carga, verificar que este compartida como "Cualquier persona con el enlace".

---

## Preguntas frecuentes

**Los cambios no se ven en la pagina**
Esperar hasta 5 minutos. La pagina se actualiza automaticamente.

**Un producto no aparece**
Verificar que tenga nombre y que el precio sea mayor a 0.

**La imagen no carga**
Verificar que el link sea correcto y que, si es de Google Drive, el archivo este compartido como publico ("Cualquier persona con el enlace").

**Como saco un producto temporalmente?**
Poner "no" en la columna Visibilidad. El producto desaparece de la pagina. Si queres que se muestre pero que no se pueda comprar, pone el Stock en `0`.
