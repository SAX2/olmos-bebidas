import type { Product } from "@/types/product";
import { formatPrice, getEffectivePrice } from "@/lib/format";

export function formatWhatsAppMessage(
  cart: Map<string, number>,
  products: Product[],
): string {
  const productMap = new Map(products.map((p) => [p.nombre, p]));
  const lines: string[] = ["Hola! Quiero hacer el siguiente pedido:"];
  let total = 0;

  for (const [name, qty] of cart) {
    const product = productMap.get(name);
    if (!product) continue;
    const price = getEffectivePrice(product);
    const subtotal = price * qty;
    total += subtotal;
    lines.push(`${qty}x ${name} - ${formatPrice(subtotal)}`);
  }

  lines.push("", `Total: ${formatPrice(total)}`);
  return lines.join("\n");
}

export function getWhatsAppUrl(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
