import OlmosLogo from "@/components/olmos-logo";
import Link from "next/link";
import {
  IconBrandInstagram,
  IconPhone,
  IconMapPin,
  IconClock,
  IconPackage,
} from "@tabler/icons-react";

const ICON_CLASS = "shrink-0 size-[22px] md:size-4";

const INFO_ITEMS = [
  {
    icon: IconBrandInstagram,
    label: "@tiendabebidas.olmos",
    href: "https://www.instagram.com/tiendabebidas.olmos/",
    external: true,
  },
  {
    icon: IconPhone,
    label: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? "",
    href: `tel:+${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? ""}`,
    external: false,
  },
  {
    icon: IconMapPin,
    label: "España 1134, San Miguel",
    href: "https://maps.app.goo.gl/acP3SveMN2EYMSh39",
    external: true,
  },
] as const;

const Header = () => {
  return (
    <>
      <div className="bg-neutral-900 text-neutral-400"></div>
      <header className="bg-surface-header">
        <div className="container mx-auto py-4 px-6 flex items-center">
          <Link href="/" className="block h-14 md:h-20">
            <OlmosLogo className="h-full w-auto" />
          </Link>
          <div className="flex items-center justify-end gap-x-4 md:gap-x-6 flex-1">
            {INFO_ITEMS.map((item) => {
              const Icon = item.icon;
              const label = item.label;
              const href = item.href;
              const content = (
                <>
                  <Icon
                    aria-hidden="true"
                    className={ICON_CLASS}
                  />
                  <span className="sr-only md:not-sr-only">{label}</span>
                </>
              );

              const className =
                "flex items-center gap-1.5 text-caption transition-colors duration-150 hover:text-neutral-200 text-foreground-inverse";

              if (href) {
                return (
                  <a
                    key={label}
                    href={href}
                    className={className}
                    {...(item.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <span key={label} className={className}>
                  {content}
                </span>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
