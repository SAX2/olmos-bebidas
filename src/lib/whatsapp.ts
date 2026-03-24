import type { Product } from "@/types/product";
import { formatPrice, getEffectivePrice, getDiscountInfo } from "@/lib/format";

export function formatWhatsAppMessage(
  cart: Map<string, number>,
  products: Product[],
): string {
  const productMap = new Map(products.map((p) => [p.nombre, p]));
  const lines: string[] = ["Hola! Quiero hacer el siguiente pedido:", ""];
  let total = 0;
  let totalUnits = 0;

  for (const [name, qty] of cart) {
    const product = productMap.get(name);
    if (!product) continue;

    const unitPrice = getEffectivePrice(product);
    const subtotal = unitPrice * qty;
    total += subtotal;
    totalUnits += qty;

    const discountInfo = getDiscountInfo(product);
    const discountBadge = discountInfo ? ` (${discountInfo.badgeText})` : "";
    const unitPricePart = qty > 1 ? ` — ${formatPrice(unitPrice)} c/u` : "";

    lines.push(`• ${qty}x ${name}${discountBadge}${unitPricePart} — ${formatPrice(subtotal)}`);
  }

  lines.push("", `Total (${totalUnits} ${totalUnits === 1 ? "unidad" : "unidades"}): ${formatPrice(total)}`);
  return lines.join("\n");
}

export function getWhatsAppUrl(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
