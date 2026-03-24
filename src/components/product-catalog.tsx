"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import ProductCard from "@/components/product-card/product-card";
import List from "@/components/list/list";
import type { Product } from "@/types/product";

const ALL_CATEGORY = "Todos";
const PROMOS_CATEGORY = "Promociones";

interface ProductCatalogProps {
  products: Product[];
  categories: string[];
}

export default function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const scrollRef = useRef<HTMLElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === ALL_CATEGORY
        ? products
        : selectedCategory === PROMOS_CATEGORY
          ? products.filter((p) => p.descuento && p.descuento > 0)
          : products.filter((p) => p.categoria === selectedCategory),
    [products, selectedCategory],
  );

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
          {[ALL_CATEGORY, PROMOS_CATEGORY, ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-4 py-2.5 rounded-full text-label transition-all duration-200 active:scale-[0.97]${
                selectedCategory === category
                  ? " bg-primary-500 text-foreground-inverse shadow-sm"
                  : " bg-neutral-100 text-foreground-secondary hover:bg-neutral-200"
              }`}
            >
              {category}
            </button>
          ))}
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
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.nombre}
            product={product}
            priority={index < 8}
          />
        ))}
      </List>
    </>
  );
}
