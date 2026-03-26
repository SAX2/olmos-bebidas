export type DiscountType = "porcentaje" | "monto";

export interface Product {
  nombre: string;
  precio: number;
  visibilidad: boolean;
  imagen: string;
  categoria: string;
  cantidadMaxima: number;
  descuento?: number;
  descuentoTipo?: DiscountType;
  destacado?: boolean;
}
