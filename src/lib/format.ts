import type { Product } from "@/types/product";

export function formatPrice(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function getDiscountInfo(product: Product) {
  if (!product.descuento || product.descuento <= 0) return null;

  const isPercent = product.descuentoTipo !== "monto";
  const finalPrice = isPercent
    ? Math.round(product.precio * (1 - product.descuento / 100))
    : product.precio - product.descuento;

  if (finalPrice >= product.precio || finalPrice <= 0) return null;

  const badgeText = isPercent
    ? `${product.descuento}% OFF`
    : `-${formatPrice(product.descuento)}`;

  return { finalPrice, badgeText };
}

export function getEffectivePrice(product: Product): number {
  const discount = getDiscountInfo(product);
  return discount ? discount.finalPrice : product.precio;
}
