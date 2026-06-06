import type { Product } from "@/types/product";

export const ALL_FILTER = "Todos";
export const PROMOS_FILTER = "Promos";
export const COMBOS_FILTER = "Combos";

interface CatalogFilterState {
  searchQuery: string;
  selectedFeature: string;
  selectedCategory: string;
  selectedSubcategory: string;
}

export function normalizeFilterText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPromo(product: Product): boolean {
  return Boolean(product.destacado || (product.descuento && product.descuento > 0));
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilterState,
): Product[] {
  const query = normalizeFilterText(filters.searchQuery.trim());

  return products.filter((product) => {
    if (filters.selectedFeature === PROMOS_FILTER && !isPromo(product)) {
      return false;
    }

    if (
      filters.selectedFeature === COMBOS_FILTER &&
      product.categoria !== COMBOS_FILTER
    ) {
      return false;
    }

    if (
      filters.selectedCategory !== ALL_FILTER &&
      product.categoria !== filters.selectedCategory
    ) {
      return false;
    }

    if (
      filters.selectedSubcategory !== ALL_FILTER &&
      product.subcategoria !== filters.selectedSubcategory
    ) {
      return false;
    }

    if (!query) return true;

    return [
      product.nombre,
      product.categoria,
      product.subcategoria ?? "",
    ].some((value) => normalizeFilterText(value).includes(query));
  });
}
