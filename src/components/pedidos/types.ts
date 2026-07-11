export type EstadoPedido = "pendiente" | "en_preparacion" | "enviado" | "entregado" | "cancelado";

export type PedidoLinea = {
  id?: string;
  pedido_id?: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type Pedido = {
  id: string;
  numero: number;
  contacto_id: string;
  contacto_nombre?: string;
  total: number;
  estado: EstadoPedido;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas?: PedidoLinea[];
};

export type PedidoInput = Omit<Pedido, "id" | "numero" | "created_at" | "contacto_nombre" | "total"> & {
  total?: number;
};
