"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconChevronLeft, IconTrash, IconBrandWhatsapp, IconMinus, IconPlus } from "@tabler/icons-react";
import { useCart } from "@/context/cart-context";
import { formatPrice, getEffectivePrice } from "@/lib/format";
import { formatWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import ImagePlaceholder from "@/components/product-card/image-placeholder";
import type { Product } from "@/types/product";

interface CartPageProps {
  products: Product[];
}

export default function CartPage({ products }: CartPageProps) {
  const { items, addItem, removeItem, deleteItem, totalItems } = useCart();

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.nombre, p])),
    [products],
  );

  const cartItems = useMemo(() => {
    const result: { product: Product; quantity: number }[] = [];
    for (const [name, qty] of items) {
      const product = productMap.get(name);
      if (product) result.push({ product, quantity: qty });
    }
    return result;
  }, [items, productMap]);

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const { product, quantity } of cartItems) {
      total += getEffectivePrice(product) * quantity;
    }
    return total;
  }, [cartItems]);

  function handleSendOrder() {
    const message = formatWhatsAppMessage(items, products);
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-6 pt-8 pb-8">
        <header className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors duration-150"
            aria-label="Volver al catalogo"
          >
            <IconChevronLeft size={24} aria-hidden="true" />
          </Link>
          <h1 className="text-heading-md text-foreground">Carrito</h1>
        </header>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-body-lg text-foreground-secondary mb-4">
            Tu carrito esta vacio
          </p>
          <Link
            href="/"
            className="bg-primary-500 text-foreground-inverse px-6 py-2.5 rounded-md text-label font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors duration-150"
          >
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-8 pb-8 flex-1 flex flex-col">
      <header className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors duration-150"
          aria-label="Volver al catalogo"
        >
          <IconChevronLeft size={24} aria-hidden="true" />
        </Link>
        <h1 className="text-heading-md text-foreground">Carrito</h1>
      </header>

      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="min-w-0">
          <ul className="divide-y divide-border">
            {cartItems.map(({ product, quantity }) => {
              const unitPrice = getEffectivePrice(product);
              const atMax = quantity >= product.cantidadMaxima;

              return (
                <li key={product.nombre} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0 md:flex-1">
                    <div className="relative w-12 h-12 shrink-0 rounded-md bg-neutral-100 border border-black/5 overflow-hidden">
                      {product.imagen ? (
                        <Image
                          src={product.imagen}
                          alt={product.nombre}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>
                    <h3 className="text-heading-sm text-foreground truncate flex-1 min-w-0">
                      {product.nombre}
                    </h3>
                    <p className="text-price text-foreground-price tabular-nums shrink-0 md:hidden">
                      {formatPrice(unitPrice * quantity)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:gap-4 md:shrink-0">
                    <div className="flex items-center h-10 rounded-md border border-primary-500 bg-surface-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => removeItem(product.nombre)}
                        className="flex items-center justify-center w-10 h-full text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 active:scale-[0.9] will-change-transform transition-[transform,background-color] duration-100"
                      >
                        <IconMinus size={18} />
                      </button>
                      <span className="flex-1 w-10 text-center text-label font-semibold text-foreground tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(product.nombre, product.cantidadMaxima)}
                        disabled={atMax}
                        className={`flex items-center justify-center w-10 h-full will-change-transform transition-[transform,background-color] duration-100${
                          atMax
                            ? " text-neutral-400 cursor-not-allowed"
                            : " text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 active:scale-[0.9]"
                        }`}
                      >
                        <IconPlus size={18} />
                      </button>
                    </div>
                    <p className="text-price text-foreground-price tabular-nums shrink-0 hidden md:block">
                      {formatPrice(unitPrice * quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteItem(product.nombre)}
                      className="flex items-center justify-center w-10 h-10 shrink-0 rounded-md text-foreground-secondary hover:text-error-500 hover:bg-error-500/10 transition-colors duration-150"
                      aria-label={`Eliminar ${product.nombre}`}
                    >
                      <IconTrash size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-surface-card p-6 shadow-sm sticky top-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-body-lg text-foreground-secondary">Subtotal</span>
            <span className="text-price text-foreground-price tabular-nums">{formatPrice(totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={handleSendOrder}
            className="w-full flex items-center justify-center gap-2 bg-success-500 text-foreground-inverse py-3 rounded-md text-label font-semibold hover:bg-success-600 active:bg-success-700 transition-colors duration-150"
          >
            <IconBrandWhatsapp size={20} aria-hidden="true" />
            Enviar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
