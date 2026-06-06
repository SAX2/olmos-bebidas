export type DiscountType = "porcentaje" | "monto";

export interface Product {
  id: string;
  sku: string;
  nombre: string;
  precio: number;
  visibilidad: boolean;
  imagen: string;
  categoria: string;
  subcategoria?: string;
  cantidadMaxima: number;
  descuento?: number;
  descuentoTipo?: DiscountType;
  destacado?: boolean;
}

export interface CategoryGroup {
  category: string;
  subcategories: string[];
  note: string;
}
