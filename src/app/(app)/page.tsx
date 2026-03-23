import List from "@/components/list/list";
import ProductCard from "@/components/product-card/product-card";
import type { Product } from "@/types/product";

const products: Product[] = [
  {
    nombre: "El Enemigo Malbec",
    precio: 10000,
    disponibilidad: true,
    imagen:
      "https://almacenbeberbien.com/wp-content/uploads/2020/05/El-Enemigo-Malbec.jpg",
    descripcion: "Descripción del producto 1",
    cantidadMaxima: 10,
    descuento: 10,
    descuentoTipo: "porcentaje",
  },
  {
    nombre: "Monster Energy Mango Loco 473ml",
    precio: 10000,
    disponibilidad: true,
    imagen:
      "https://www.casa-segal.com/wp-content/uploads/2020/03/monster-energy-473ml-mango-loco-almacen-gaseosas-casa-segal-mendoza-600x600.jpg",
    descripcion: "Descripción del producto 1",
    cantidadMaxima: 10,
    descuento: 10,
    descuentoTipo: "monto",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto py-4 px-6">
      <List>
        {products.map((product) => (
          <ProductCard key={product.nombre} product={product} />
        ))}
      </List>
    </div>
  );
}
