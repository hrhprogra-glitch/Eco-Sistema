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

export type NivelStock = "sin-stock" | "bajo" | "medio" | "alto";

export const NIVEL_STOCK_LABEL: Record<NivelStock, string> = {
  "sin-stock": "Sin stock",
  bajo: "Stock bajo",
  medio: "Stock medio",
  alto: "Stock alto",
};

// Clasifica un producto por nivel de stock, para filtrar rápido "qué se está por
// terminar" sin tener que leer la cantidad exacta de cada fila. Si el producto tiene
// un límite de stock propio cargado (limite_stock > 0), se usa como referencia: bajo
// es estar en o por debajo del límite, alto es tener el triple o más. Si no hay límite
// cargado (el caso más común hoy, recién arrancando el catálogo), se cae a umbrales
// genéricos por cantidad -- igual sirve para separar "casi nada" de "bastante".
export function nivelStock(stock: number, limiteStock: number): NivelStock {
  if (stock <= 0) return "sin-stock";
  if (limiteStock > 0) {
    if (stock <= limiteStock) return "bajo";
    if (stock <= limiteStock * 3) return "medio";
    return "alto";
  }
  if (stock <= 10) return "bajo";
  if (stock <= 50) return "medio";
  return "alto";
}
