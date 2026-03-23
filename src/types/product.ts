export type DiscountType = "porcentaje" | "monto";

export interface Product {
  nombre: string;
  precio: number;
  disponibilidad: boolean;
  imagen: string;
  descripcion: string;
  cantidadMaxima: number;
  descuento?: number;
  descuentoTipo?: DiscountType;
}
