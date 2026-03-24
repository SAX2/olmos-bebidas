import List from "@/components/list/list";
import ProductCard from "@/components/product-card/product-card";
import { testProducts } from "@/data/test-products";

const sortedProducts = [...testProducts].sort((a, b) => {
  const aHasDiscount = a.descuento && a.descuento > 0 ? 1 : 0;
  const bHasDiscount = b.descuento && b.descuento > 0 ? 1 : 0;
  return bHasDiscount - aHasDiscount;
});

export default function Home() {
  return (
    <div className="container mx-auto py-4 px-6">
      <List>
        {sortedProducts.map((product, index) => (
          <ProductCard key={product.nombre} product={product} priority={index < 8} />
        ))}
      </List>
    </div>
  );
}
