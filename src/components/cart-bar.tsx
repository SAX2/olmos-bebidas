"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice, getEffectivePrice } from "@/lib/format";
import type { Product } from "@/types/product";

const MAX_PREVIEW = 3;
const ROTATIONS = ["-rotate-6", "rotate-0", "rotate-6"];

interface CartBarProps {
  products: Product[];
}

export default function CartBar({ products }: CartBarProps) {
  const { items, totalItems } = useCart();

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.nombre, p])),
    [products],
  );

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [name, qty] of items) {
      const product = productMap.get(name);
      if (product) total += getEffectivePrice(product) * qty;
    }
    return total;
  }, [items, productMap]);

  const previewProducts = useMemo(() => {
    const result: Product[] = [];
    for (const [name] of items) {
      const product = productMap.get(name);
      if (product?.imagen) result.push(product);
      if (result.length >= MAX_PREVIEW) break;
    }
    return result;
  }, [items, productMap]);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)] animate-cart-bar-enter motion-reduce:animate-none">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {previewProducts.length > 0 ? (
            <div className="hidden md:flex items-center pl-3">
              <div className="flex items-center -space-x-3">
                {previewProducts.map((product, i) => (
                  <div
                    key={product.nombre}
                    className={`relative w-12 h-12 rounded-lg border-2 border-white bg-white shadow-md overflow-hidden ${ROTATIONS[i]} will-change-[transform,opacity] animate-thumb-pop-in motion-reduce:animate-none`}
                    style={{ zIndex: MAX_PREVIEW - i, animationDelay: `${i * 50}ms` }}
                  >
                    <Image
                      src={product.imagen}
                      alt={product.nombre}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col">
            <span className="text-label font-semibold text-foreground">
              {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </span>
            <span className="text-price text-foreground-price">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        <Link
          href="/carrito"
          className="flex-1 md:flex-initial text-center bg-primary-500 text-foreground-inverse px-6 py-2.5 rounded-md text-label font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors duration-150"
        >
          Ver pedido
        </Link>
      </div>
    </div>
  );
}
