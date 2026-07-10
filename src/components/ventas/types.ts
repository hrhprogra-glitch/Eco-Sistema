export type VentaEstado = "borrador" | "confirmada" | "facturada" | "cancelada";

export type VentaLinea = {
  id?: string;
  venta_id?: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type Venta = {
  id: string;
  numero: number;
  contacto_id: string;
  contacto_nombre?: string;
  total: number;
  estado: VentaEstado;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas?: VentaLinea[];
};

export type VentaInput = Omit<Venta, "id" | "numero" | "created_at" | "contacto_nombre" | "total"> & {
  total?: number;
};
