// Fila agregada de la vista Stock: existencia de un producto en un almacén, sumando
// todos sus lotes vigentes ahí (calculado en la API, no es una tabla propia).
export type StockPorAlmacen = {
  producto_id: string;
  producto_nombre: string;
  sku: string;
  almacen_id: string;
  almacen_nombre: string;
  cantidad: number;
  unidad: string;
};

// Detalle de lote, para expandir una fila de stock y ver de qué lotes se compone.
export type LoteDetalle = {
  id: string;
  numero_lote: string | null;
  almacen_id: string;
  almacen_nombre: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  costo_unitario: number;
  fecha_vencimiento: string | null;
  created_at: string;
};
