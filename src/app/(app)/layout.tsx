import React from "react";
import Header from "@/components/header/header";
import PromoHeader from "@/components/header/promo-header";
import { LocalBusinessJsonLd } from "@/components/json-ld";
import { CartProvider } from "@/context/cart-context";
import { getPromoDestacada } from "@/lib/sheets";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const promo = await getPromoDestacada();

  return (
    <CartProvider>
      <LocalBusinessJsonLd />
      <div className="min-h-dvh flex flex-col">
        <Header />
        {promo && <PromoHeader texto={promo} />}
        {children}
      </div>
    </CartProvider>
  );
}
