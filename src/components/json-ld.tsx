export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    name: "Olmos Bebidas",
    description:
      "Tienda de bebidas en San Miguel, Buenos Aires. Cervezas, vinos, gaseosas, energizantes y más.",
    url: "https://www.olmosbebidas.com.ar",
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER,
    address: {
      "@type": "PostalAddress",
      streetAddress: "España 1134",
      addressLocality: "San Miguel",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -34.539575,
      longitude: -58.714609,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: "13:30",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:30",
        closes: "21:00",
      },
    ],
    sameAs: ["https://www.instagram.com/tiendabebidas.olmos/"],
    image: "https://www.olmosbebidas.com.ar/og-image.png",
    priceRange: "$$",
    areaServed: [
      { "@type": "City", name: "San Miguel" },
      { "@type": "City", name: "Muñiz" },
      { "@type": "City", name: "Bella Vista" },
      { "@type": "City", name: "José C. Paz" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
