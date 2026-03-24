"use client";

import { useState, useMemo, useRef, useCallback, useEffect, startTransition } from "react";
import ProductCard from "@/components/product-card/product-card";
import List from "@/components/list/list";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/types/product";

const ALL_CATEGORY = "Todos";
const PROMOS_CATEGORY = "Promociones";
const PAGE_SIZE = 12;

interface ProductCatalogProps {
  products: Product[];
  categories: string[];
}

export default function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const { addItem, removeItem, getQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === ALL_CATEGORY
        ? products
        : selectedCategory === PROMOS_CATEGORY
          ? products.filter((p) => p.descuento && p.descuento > 0)
          : products.filter((p) => p.categoria === selectedCategory),
    [products, selectedCategory],
  );

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTransition(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
          });
        }
      },
      { rootMargin: "0px 0px 200px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filteredProducts.length]);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 0);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateFades();
    const observer = new ResizeObserver(updateFades);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, [updateFades, categories]);

  return (
    <>
      <div className="relative">
        <nav
          ref={scrollRef}
          onScroll={updateFades}
          aria-label="Filtrar por categoría"
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-none"
        >
          {[ALL_CATEGORY, PROMOS_CATEGORY, ...categories].map((category) => {
            const isPromo = category === PROMOS_CATEGORY;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`shrink-0 px-4 py-2.5 border rounded-full text-label will-change-transform transition-all duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none${
                  isSelected
                    ? isPromo
                      ? " border-primary-500 bg-primary-500 text-foreground-inverse shadow-md shadow-primary-500/25"
                      : " border-transparent bg-primary-500 text-foreground-inverse shadow-sm"
                    : isPromo
                      ? " border-dashed border-primary-300 text-primary-600 bg-primary-50 hover:bg-primary-100"
                      : " border-transparent bg-neutral-100 text-foreground-secondary hover:bg-neutral-200"
                }`}
              >
                {isPromo && (
                  <span className="inline-block mr-1" aria-hidden="true">
                    %
                  </span>
                )}
                {category}
              </button>
            );
          })}
        </nav>

        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-4 w-16 bg-linear-to-r from-surface-background to-transparent transition-opacity duration-200${
            showLeftFade ? " opacity-100" : " opacity-0"
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-linear-to-l from-surface-background to-transparent transition-opacity duration-200${
            showRightFade ? " opacity-100" : " opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      <List>
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.nombre}
            product={product}
            quantity={getQuantity(product.nombre)}
            onAdd={() => addItem(product.nombre, product.cantidadMaxima)}
            onRemove={() => removeItem(product.nombre)}
            priority={index < 8}
          />
        ))}
      </List>

      {visibleCount < filteredProducts.length && (
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      )}
    </>
  );
}
