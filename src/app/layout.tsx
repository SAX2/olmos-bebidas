import { Agentation } from "agentation";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.olmosbebidas.com.ar"),
  title: {
    default: "Olmos Bebidas | Bebidas a domicilio en San Miguel",
    template: "%s | Olmos Bebidas",
  },
  description:
    "Tienda de bebidas en San Miguel, Buenos Aires. Pedí online y recibí en tu domicilio. Cervezas, vinos, gaseosas, energizantes y más.",
  keywords: [
    "bebidas a domicilio",
    "tienda de bebidas",
    "bebidas San Miguel",
    "escabio a domicilio",
    "distribuidora de bebidas",
    "bebidas Muniz",
    "bebidas Bella Vista",
    "bebidas Jose C Paz",
    "bebidas zona norte",
  ],
  authors: [{ name: "Olmos Bebidas" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://www.olmosbebidas.com.ar",
    siteName: "Olmos Bebidas",
    title: "Olmos Bebidas | Bebidas a domicilio en San Miguel",
    description:
      "Tienda de bebidas en San Miguel, Buenos Aires. Pedí online y recibí en tu domicilio.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Olmos Bebidas - Tienda de bebidas en San Miguel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olmos Bebidas | Bebidas a domicilio en San Miguel",
    description:
      "Tienda de bebidas en San Miguel, Buenos Aires. Pedí online y recibí en tu domicilio.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://www.olmosbebidas.com.ar",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
