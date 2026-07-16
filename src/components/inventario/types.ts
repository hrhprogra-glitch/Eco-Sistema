export type Producto = {
  id: string;
  nombre: string;
  sku: string;
  stock: number;
  precio: number;
  favorito: boolean;
  foto_url: string | null;
  limite_stock: number;
  tipo: "bienes" | "servicio" | "combo";
  rastrear_inventario: boolean;
  unidad: string;
  impuesto_venta: string | null;
  codigo_detraccion: string | null;
  costo: number;
  categoria: string | null;
  referencia: string | null;
  codigo_barras: string | null;
  notas_internas: string | null;
  vende: boolean;
  compra: boolean;
  es_gasto: boolean;
  created_at: string;
  updated_at: string;
};

export type InventarioTables = {
  productos: {
    Row: Producto;
    Insert: Omit<Producto, "id" | "created_at" | "updated_at"> & Partial<Pick<Producto, "id" | "created_at" | "updated_at">>;
    Update: Partial<Producto>;
  };
};
