"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { IconMinus, IconPlus, IconStarFilled } from "@tabler/icons-react";
import ImagePlaceholder from "@/components/product-card/image-placeholder";
import { formatPrice, getDiscountInfo } from "@/lib/format";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd?: () => void;
  onRemove?: () => void;
  priority?: boolean;
}

const ProductCard = memo(function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  priority,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = !product.disponibilidad;
  const discount = getDiscountInfo(product);
  const showPlaceholder = !product.imagen || imageError;
  const atMax = quantity >= product.cantidadMaxima;

  return (
    <article
      className={`cv-auto flex flex-col bg-surface-card border border-border shadow-sm transition-shadow duration-200 overflow-hidden${
        isOutOfStock ? " opacity-50" : " hover:shadow-md"
      }`}
    >
      <div className="relative aspect-square bg-neutral-100">
        {showPlaceholder ? (
          <ImagePlaceholder />
        ) : (
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            className="object-contain"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            priority={priority}
            onError={() => setImageError(true)}
          />
        )}

        {product.destacado && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-primary-100 text-primary-700 border border-primary-200 shadow-sm text-promo font-bold rounded-full px-2 py-1">
            <IconStarFilled size={14} />
            Destacado
          </span>
        )}

        {discount ? (
          <span className="absolute top-2 right-2 bg-surface-promo text-foreground-promo text-promo font-bold rounded-full px-2 py-1">
            {discount.badgeText}
          </span>
        ) : null}

        {isOutOfStock ? (
          <span className="absolute top-2 right-2 bg-error-500 text-foreground-inverse text-promo rounded-full px-2 py-1">
            Sin stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div className="min-h-12.5 pt-4">
          <h2 className="text-heading-sm font-semibold text-foreground line-clamp-2">
            {product.nombre}
          </h2>
        </div>

        {product.categoria ? (
          <p className="text-body-sm text-foreground-secondary">
            {product.categoria}
          </p>
        ) : null}

        <div className="flex items-baseline gap-2">
          {discount ? (
            <span className="text-body-sm line-through text-neutral-400">
              {formatPrice(product.precio)}
            </span>
          ) : null}
          <span className="text-price text-foreground-price">
            {formatPrice(discount ? discount.finalPrice : product.precio)}
          </span>
        </div>

        <div className="mt-auto relative h-10">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={onAdd}
            aria-hidden={quantity > 0}
            tabIndex={quantity > 0 ? -1 : undefined}
            className={`absolute inset-0 w-full h-full rounded-md text-label will-change-[opacity,transform] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none${
              isOutOfStock
                ? " bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                : " bg-primary-500 text-foreground-inverse hover:bg-primary-600 active:bg-primary-700 active:scale-[0.97]"
            }${
              quantity > 0
                ? " opacity-0 scale-95 pointer-events-none"
                : " opacity-100 scale-100"
            }`}
          >
            Agregar al carrito
          </button>

          <div
            aria-hidden={quantity === 0}
            className={`absolute inset-0 flex items-center h-full rounded-md border border-primary-500 bg-surface-card overflow-hidden will-change-[opacity,transform] transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none${
              quantity > 0
                ? " opacity-100 scale-100"
                : " opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={onRemove}
              tabIndex={quantity === 0 ? -1 : undefined}
              className="flex items-center justify-center w-10 h-full text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 active:scale-[0.9] will-change-transform transition-[transform,background-color] duration-100 ease-out motion-reduce:transition-none text-lg font-semibold"
            >
              <IconMinus size={18} />
            </button>
            <span className="flex-1 text-center text-label font-semibold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={onAdd}
              disabled={atMax}
              tabIndex={quantity === 0 ? -1 : undefined}
              className={`flex items-center justify-center w-10 h-full will-change-transform transition-[transform,background-color] duration-100 ease-out motion-reduce:transition-none text-lg font-semibold${
                atMax
                  ? " text-neutral-400 cursor-not-allowed"
                  : " text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 active:scale-[0.9]"
              }`}
            >
              <IconPlus size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
