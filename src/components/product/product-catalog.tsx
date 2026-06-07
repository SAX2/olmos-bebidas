"use client";

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IconAdjustmentsHorizontal,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import ProductCard from "@/components/product/product-card";
import ProductList from "@/components/product/product-list";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart/cart-context";
import {
  ALL_FILTER,
  COMBOS_FILTER,
  PROMOS_FILTER,
  filterProducts,
} from "@/lib/catalog-filter";
import type { CategoryGroup, Product } from "@/types/product";

const PAGE_SIZE = 12;

interface ProductCatalogProps {
  products: Product[];
  categoryGroups: CategoryGroup[];
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function FilterChip({ label, selected, onSelect }: FilterChipProps) {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      size="sm"
      aria-pressed={selected}
      onClick={onSelect}
      className="h-auto min-h-10 max-w-full justify-start whitespace-normal rounded-md px-3 py-2 text-left text-sm font-normal leading-tight tracking-normal"
    >
      {label}
    </Button>
  );
}

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
}

function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="text-body-sm font-semibold text-foreground-secondary">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

interface CatalogFiltersProps {
  categoryGroups: CategoryGroup[];
  selectedFeature: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onFeatureSelect: (feature: string) => void;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
}

function CatalogFilters({
  categoryGroups,
  selectedFeature,
  selectedCategory,
  selectedSubcategory,
  onFeatureSelect,
  onCategorySelect,
  onSubcategorySelect,
}: CatalogFiltersProps) {
  const mainCategoryGroups = categoryGroups.filter(
    (group) => group.category !== COMBOS_FILTER,
  );
  const selectedGroup = categoryGroups.find(
    (group) => group.category === selectedCategory,
  );
  const subcategoryOptions = selectedGroup?.subcategories ?? [];

  return (
    <div className="flex flex-col gap-7">
      <FilterGroup title="Destacados">
        {[PROMOS_FILTER, COMBOS_FILTER].map((feature) => (
          <FilterChip
            key={feature}
            label={feature}
            selected={selectedFeature === feature}
            onSelect={() => onFeatureSelect(feature)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Categorias">
        {mainCategoryGroups.map((group) => (
          <FilterChip
            key={group.category}
            label={group.category}
            selected={selectedCategory === group.category}
            onSelect={() => onCategorySelect(group.category)}
          />
        ))}
      </FilterGroup>

      {selectedCategory !== ALL_FILTER && subcategoryOptions.length > 0 ? (
        <FilterGroup title="Subcategorias">
          {[ALL_FILTER, ...subcategoryOptions].map((subcategory) => (
            <FilterChip
              key={subcategory}
              label={subcategory}
              selected={selectedSubcategory === subcategory}
              onSelect={() => onSubcategorySelect(subcategory)}
            />
          ))}
        </FilterGroup>
      ) : null}
    </div>
  );
}

export default function ProductCatalog({
  products,
  categoryGroups,
}: ProductCatalogProps) {
  const { addItem, removeItem, getQuantity } = useCart();
  const [selectedFeature, setSelectedFeature] = useState(ALL_FILTER);
  const [selectedCategory, setSelectedCategory] = useState(ALL_FILTER);
  const [selectedSubcategory, setSelectedSubcategory] = useState(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const resetVisibleCount = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleFeatureSelect = useCallback((feature: string) => {
    startTransition(() => {
      setSelectedFeature((current) =>
        current === feature ? ALL_FILTER : feature,
      );
      setSelectedCategory(ALL_FILTER);
      setSelectedSubcategory(ALL_FILTER);
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    startTransition(() => {
      setSelectedFeature(ALL_FILTER);
      setSelectedCategory((current) =>
        current === category ? ALL_FILTER : category,
      );
      setSelectedSubcategory(ALL_FILTER);
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const handleSubcategorySelect = useCallback((subcategory: string) => {
    startTransition(() => {
      setSelectedSubcategory(subcategory);
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      startTransition(resetVisibleCount);
    },
    [resetVisibleCount],
  );

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, {
        searchQuery: deferredSearchQuery,
        selectedFeature,
        selectedCategory,
        selectedSubcategory,
      }),
    [
      products,
      deferredSearchQuery,
      selectedFeature,
      selectedCategory,
      selectedSubcategory,
    ],
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
  }, [filteredProducts.length]);

  const filterProps = {
    categoryGroups,
    selectedFeature,
    selectedCategory,
    selectedSubcategory,
    onFeatureSelect: handleFeatureSelect,
    onCategorySelect: handleCategorySelect,
    onSubcategorySelect: handleSubcategorySelect,
  };

  return (
    <div className="grid gap-7 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <aside className="hidden lg:sticky lg:top-5 lg:flex lg:flex-col lg:gap-8 lg:px-2 lg:py-5">
        <CatalogFilters {...filterProps} />
      </aside>

      <section className="flex min-w-0 flex-col gap-6">
        <div className="flex gap-2">
          <InputGroup className="h-12 rounded-md border-border bg-surface-card">
            <InputGroupAddon align="inline-start">
              <IconSearch aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar entre productos..."
              aria-label="Buscar productos"
              className="text-body-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {searchQuery ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Limpiar búsqueda"
                  onClick={() => handleSearchChange("")}
                >
                  <IconX aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 lg:hidden"
              >
                <IconAdjustmentsHorizontal data-icon="inline-start" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="data-[side=right]:w-[88vw]"
            >
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Elegí las categorías que querés ver en el catálogo.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                <CatalogFilters {...filterProps} />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" size="lg" className="w-full">
                    Ver {filteredProducts.length} productos
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-body-base text-foreground-tertiary">
            No se encontraron productos
          </p>
        ) : (
          <ProductList>
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getQuantity(product.id)}
                onAdd={() => addItem(product.id, product.cantidadMaxima)}
                onRemove={() => removeItem(product.id)}
                priority={index < 8}
              />
            ))}
          </ProductList>
        )}

        {visibleCount < filteredProducts.length && (
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        )}
      </section>
    </div>
  );
}
