interface ListProps {
  children: React.ReactNode;
}

const List = ({ children }: ListProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
};

export default List;