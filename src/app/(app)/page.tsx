import ProductCatalog from "@/components/product/product-catalog";
import CartBar from "@/components/cart/cart-bar";
import { getProducts, getCategoryGroups } from "@/lib/sheets";
import type { CategoryGroup, Product } from "@/types/product";

export const revalidate = 300;

function getAvailableCategoryGroups(
  products: Product[],
  sheetCategoryGroups: CategoryGroup[],
): CategoryGroup[] {
  if (products.length === 0) return sheetCategoryGroups;

  const productCategories = new Set(products.map((p) => p.categoria).filter(Boolean));
  const productSubcategories = new Map<string, Set<string>>();

  for (const product of products) {
    if (!product.categoria) continue;
    if (!productSubcategories.has(product.categoria)) {
      productSubcategories.set(product.categoria, new Set());
    }

    if (product.subcategoria) {
      productSubcategories.get(product.categoria)?.add(product.subcategoria);
    }
  }

  const orderedGroups = sheetCategoryGroups
    .filter((group) => productCategories.has(group.category))
    .map((group) => {
      const availableSubcategories = productSubcategories.get(group.category) ?? new Set();
      const subcategories =
        group.subcategories.length > 0
          ? group.subcategories.filter((subcategory) =>
              availableSubcategories.has(subcategory),
            )
          : [...availableSubcategories];

      return { ...group, subcategories };
    });

  const orderedNames = new Set(orderedGroups.map((group) => group.category));
  const unlistedGroups = [...productCategories]
    .filter((category) => !orderedNames.has(category))
    .map((category) => ({
      category,
      subcategories: [...(productSubcategories.get(category) ?? new Set())],
      note: "",
    }));

  return [...orderedGroups, ...unlistedGroups];
}

export default async function Home() {
  const [products, sheetCategoryGroups] = await Promise.all([
    getProducts(),
    getCategoryGroups(),
  ]);

  const sortedProducts = [...products].sort((a, b) => {
    const aFeatured = a.destacado ? 1 : 0;
    const bFeatured = b.destacado ? 1 : 0;
    return bFeatured - aFeatured;
  });

  const categoryGroups = getAvailableCategoryGroups(sortedProducts, sheetCategoryGroups);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <h1 className="sr-only">Olmos Bebidas - Tienda de bebidas en San Miguel</h1>
      <ProductCatalog products={sortedProducts} categoryGroups={categoryGroups} />
      <CartBar products={sortedProducts} />
    </div>
  );
}
