import ProductCatalog from "@/components/product-catalog";
import CartBar from "@/components/cart-bar";
import { getProducts } from "@/lib/sheets";

export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();

  const sortedProducts = [...products].sort((a, b) => {
    const aFeatured = a.destacado ? 1 : 0;
    const bFeatured = b.destacado ? 1 : 0;
    return bFeatured - aFeatured;
  });

  const categories = [...new Set(products.map((p) => p.categoria).filter(Boolean))];

  return (
    <div className="container mx-auto pt-8 pb-24 px-6">
      <h1 className="sr-only">Olmos Bebidas - Tienda de bebidas en San Miguel</h1>
      <ProductCatalog products={sortedProducts} categories={categories} />
      <CartBar products={sortedProducts} />
    </div>
  );
}
