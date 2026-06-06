import OlmosLogo from "@/components/olmos-logo";
import Link from "next/link";
import {
  IconBrandInstagram,
  IconPhone,
  IconMapPin,
} from "@tabler/icons-react";

const ICON_CLASS = "size-6 shrink-0 md:size-5";

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
        <div className="mx-auto flex w-full max-w-[1600px] items-center px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="block h-16 md:h-[88px]">
            <OlmosLogo className="h-full w-auto" />
          </Link>
          <div className="flex flex-1 items-center justify-end gap-x-5 md:gap-x-8">
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
                "flex items-center gap-2 text-body-sm font-medium text-foreground-inverse transition-colors duration-150 hover:text-neutral-200";

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
