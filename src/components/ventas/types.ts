export type VentaEstado = "borrador" | "confirmada" | "facturada" | "cancelada";

export type VentaLinea = {
  id?: number;
  venta_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type Venta = {
  id: number;
  contacto_id: number;
  contacto_nombre?: string;
  total: number;
  estado: VentaEstado;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas?: VentaLinea[];
};

export type VentaInput = Omit<Venta, "id" | "created_at" | "contacto_nombre" | "total"> & {
  total?: number;
};
