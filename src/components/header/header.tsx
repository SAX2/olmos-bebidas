import React from "react";
import OlmosLogo from "@/components/olmos-logo";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <header className="bg-surface-header">
        <div className="container mx-auto py-4 px-6 flex items-center justify-center">
          <Link href="/" className="block">
            <OlmosLogo height={56} />
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;
