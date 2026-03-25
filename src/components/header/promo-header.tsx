const REPEAT_COUNT = 6;

function MarqueeSegment({ texto }: { texto: string }) {
  return (
    <span className="flex items-center gap-6 text-foreground-promo text-promo uppercase whitespace-nowrap" aria-hidden="true">
      {Array.from({ length: REPEAT_COUNT }, (_, i) => (
        <span key={i} className="inline-flex items-center gap-3">
          <span className="leading-none">{texto}</span>
        </span>
      ))}
    </span>
  );
}

const PromoHeader = ({ texto }: { texto: string }) => {
  return (
    <div className="relative bg-surface-promo overflow-hidden py-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[8%] before:bg-linear-to-r before:from-surface-promo before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[8%] after:bg-linear-to-l after:from-surface-promo after:to-transparent after:z-10" role="marquee">
      <div className="animate-marquee flex w-max will-change-transform motion-reduce:animate-none motion-reduce:w-auto motion-reduce:justify-center motion-reduce:mx-auto motion-reduce:px-6">
        <MarqueeSegment texto={texto} />
        <MarqueeSegment texto={texto} />
      </div>
      <span className="sr-only">{texto}</span>
    </div>
  );
};

export default PromoHeader;
