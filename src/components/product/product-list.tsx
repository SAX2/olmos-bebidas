interface ProductListProps {
  children: React.ReactNode;
}

const ProductList = ({ children }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
};

export default ProductList;
