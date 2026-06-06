"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
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
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [id, qty] of items) {
      const product = productMap.get(id);
      if (product) total += getEffectivePrice(product) * qty;
    }
    return total;
  }, [items, productMap]);

  const previewProducts = useMemo(() => {
    const result: Product[] = [];
    for (const [id] of items) {
      const product = productMap.get(id);
      if (product?.imagen) result.push(product);
      if (result.length >= MAX_PREVIEW) break;
    }
    return result;
  }, [items, productMap]);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-card shadow-[0_-1px_4px_rgba(0,0,0,0.08)] animate-cart-bar-enter motion-reduce:animate-none">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {previewProducts.length > 0 ? (
            <div className="hidden items-center pl-3 md:flex">
              <div className="flex items-center -space-x-3">
                {previewProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className={`relative size-14 overflow-hidden rounded-md border-2 border-white bg-white shadow-sm ${ROTATIONS[i]} animate-thumb-pop-in will-change-[transform,opacity] motion-reduce:animate-none`}
                    style={{ zIndex: MAX_PREVIEW - i, animationDelay: `${i * 50}ms` }}
                  >
                    <Image
                      src={product.imagen}
                      alt={product.nombre}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col">
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
          className="flex-1 rounded-md bg-primary-500 px-7 py-3 text-center text-label font-semibold text-foreground-inverse transition-colors duration-150 hover:bg-primary-600 active:bg-primary-700 md:flex-initial"
        >
          Ver pedido
        </Link>
      </div>
    </div>
  );
}
