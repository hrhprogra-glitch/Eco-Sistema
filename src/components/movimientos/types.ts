// Sin sesión de gestión propia todavía (ver GET /api/almacenes) -- solo para poblar los
// <select> de Entradas/Salidas.
export type Almacen = {
  id: string;
  nombre: string;
  ubicacion: string | null;
};

// Fila del "cuaderno": una entrada, salida o ajuste ya confirmado, con el nombre de
// producto/almacén/lote resuelto para mostrar directo en la tabla (join hecho en la API).
export type MovimientoStock = {
  id: string;
  producto_id: string;
  producto_nombre: string;
  almacen_id: string;
  almacen_nombre: string;
  lote_id: string | null;
  lote_numero: string | null;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo: string;
  cliente: string | null;
  trabajador: string | null;
  entrada_id: string | null;
  fecha: string;
  created_at: string;
};

// Encabezado de una Entrada (factura de proveedor). Mientras está en "borrador" no afecta
// stock; recién al confirmarla se generan los lotes y las filas de movimientos_stock.
export type Entrada = {
  id: string;
  numero: number;
  proveedor_id: string;
  proveedor_nombre?: string;
  numero_factura_proveedor: string | null;
  estado: "borrador" | "confirmada" | "cancelada" | "devuelta";
  // Precios de entrada_lineas.costo_unitario y total siempre se cargan sin IGV.
  moneda: "PEN" | "USD";
  total: number;
  fecha: string;
  notas: string | null;
  // Ruta del PDF de la factura/boleta importada (ver EntradaForm.tsx), servida vía
  // GET /api/uploads/factura/[archivo]. null si la compra se cargó a mano, sin importar
  // ningún PDF.
  factura_pdf_url: string | null;
  lineas?: EntradaLinea[];
  created_at: string;
  updated_at: string;
};

export type EntradaLinea = {
  id: string;
  entrada_id: string;
  producto_id: string;
  producto_nombre?: string;
  almacen_id: string;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  fecha_vencimiento: string | null;
};

// Línea del carrito de la Salida rápida (POS): producto + cantidad, sin lote -- el lote
// se resuelve por FIFO en el servidor. producto_nombre/stock_disponible son solo para
// mostrar y validar en la UI, no viajan al servidor tal cual.
export type SalidaCarritoLinea = {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  stock_disponible: number;
};

// Body que espera POST /api/movimientos/salidas: el carrito completo, confirmado como
// una única transacción.
export type SalidaCarritoInput = {
  lineas: { producto_id: string; cantidad: number }[];
  fecha?: string;
};

export type MovimientosTables = {
  entradas: {
    Row: Entrada;
    Insert: Omit<Entrada, "id" | "numero" | "created_at" | "updated_at" | "estado" | "total"> &
      Partial<Pick<Entrada, "id" | "numero" | "created_at" | "updated_at" | "estado" | "total">>;
    Update: Partial<Entrada>;
  };
  movimientos_stock: {
    Row: MovimientoStock;
    Insert: Omit<MovimientoStock, "id" | "created_at">;
    Update: never;
  };
};
