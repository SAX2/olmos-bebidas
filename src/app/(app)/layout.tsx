import React from "react";
import Header from "@/components/header/header";
import PromoHeader from "@/components/header/promo-header";
import { CartProvider } from "@/context/cart-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-dvh flex flex-col">
        <Header />
        <PromoHeader />
        {children}
      </div>
    </CartProvider>
  );
}
