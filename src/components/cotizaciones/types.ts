export type EstadoCotizacion = "borrador" | "enviada" | "aceptada" | "rechazada";

export type CotizacionLinea = {
  id?: string;
  cotizacion_id?: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type Cotizacion = {
  id: string;
  numero: number;
  contacto_id: string;
  contacto_nombre?: string;
  total: number;
  estado: EstadoCotizacion;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas?: CotizacionLinea[];
};

export type CotizacionInput = Omit<Cotizacion, "id" | "numero" | "created_at" | "contacto_nombre" | "total"> & {
  total?: number;
};
