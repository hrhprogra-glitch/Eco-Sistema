export type EstadoFactura = "borrador" | "enviada" | "pagada" | "vencida";

export type FacturaLinea = {
  id?: string;
  factura_id?: string;
  producto_id?: string | null;
  descripcion?: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type FacturaPago = {
  id: string;
  factura_id: string;
  monto: number;
  fecha: string;
  metodo?: string | null;
  notas?: string | null;
  created_at: string;
};

export type Factura = {
  id: string;
  numero: number;
  contacto_id: string;
  contacto_nombre?: string;
  cotizacion_id?: string | null;
  total: number;
  estado: EstadoFactura;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas?: FacturaLinea[];
  pagos?: FacturaPago[];
};

export type FacturaInput = Omit<Factura, "id" | "numero" | "created_at" | "contacto_nombre" | "total" | "pagos"> & {
  total?: number;
};
