const PromoHeader = ({ texto }: { texto: string }) => {
  return (
    <div className="bg-surface-promo">
      <div className="container mx-auto py-2 px-6 flex items-center justify-center">
        <p className="text-foreground-promo text-promo uppercase">
          {texto}
        </p>
      </div>
    </div>
  );
};

export default PromoHeader;
