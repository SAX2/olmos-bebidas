import React from "react";
import Header from "@/components/header/header";
import PromoHeader from "@/components/header/promo-header";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <PromoHeader />
      {children}
    </div>
  );
};

export default layout;
