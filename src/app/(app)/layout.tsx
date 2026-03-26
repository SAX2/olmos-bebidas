import { Suspense } from "react";
import Header from "@/components/header/header";
import PromoHeader from "@/components/header/promo-header";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { CartProvider } from "@/components/cart/cart-context";
import { getPromoDestacada } from "@/lib/sheets";

async function PromoSection() {
  const promo = await getPromoDestacada();
  if (!promo) return null;
  return <PromoHeader texto={promo} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <LocalBusinessJsonLd />
      <div className="min-h-dvh flex flex-col">
        <Header />
        <Suspense fallback={null}>
          <PromoSection />
        </Suspense>
        {children}
      </div>
    </CartProvider>
  );
}
