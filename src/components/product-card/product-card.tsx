"use client";

import { useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "@/components/product-card/image-placeholder";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  priority?: boolean;
}

function formatPrice(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getDiscountInfo(product: Product) {
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

const ProductCard = ({ product, onAddToCart, priority }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = !product.disponibilidad;
  const discount = getDiscountInfo(product);
  const showPlaceholder = !product.imagen || imageError;

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
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            onError={() => setImageError(true)}
          />
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
        <div className="min-h-[3.125rem] pt-4">
          <h3 className="text-heading-sm font-semibold text-foreground line-clamp-2">
            {product.nombre}
          </h3>
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

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product)}
          className={`mt-auto w-full h-10 rounded-md text-label transition-colors duration-150${
            isOutOfStock
              ? " bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
              : " bg-primary-500 text-foreground-inverse hover:bg-primary-600 active:bg-primary-700"
          }`}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
