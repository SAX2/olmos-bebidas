import type { Metadata } from "next";
import CartPage from "@/components/cart-page";
import { getProducts } from "@/lib/sheets";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function CarritoPage() {
  const products = await getProducts();

  return <CartPage products={products} />;
}
