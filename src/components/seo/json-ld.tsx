export function LocalBusinessJsonLd() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    "@id": "https://www.olmosbebidas.com.ar/#business",
    name: "Olmos Bebidas",
    description:
      "Tienda de bebidas en San Miguel, Buenos Aires. Cervezas, vinos, gaseosas, energizantes y más. Pedí online y recibí en tu domicilio.",
    url: "https://www.olmosbebidas.com.ar",
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "España 1134",
      addressLocality: "San Miguel",
      addressRegion: "Buenos Aires",
      postalCode: "1663",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -34.5395761,
      longitude: -58.7153199,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      availableLanguage: "Spanish",
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
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.olmosbebidas.com.ar",
        actionPlatform: "https://schema.org/DesktopWebPlatform",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
