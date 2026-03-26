interface ProductListProps {
  children: React.ReactNode;
}

const ProductList = ({ children }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
};

export default ProductList;