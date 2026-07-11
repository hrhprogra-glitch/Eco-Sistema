export type MovimientoInventario = {
  id: string;
  producto: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  created_at: string;
};

export type MovimientosTables = {
  movimientos_inventario: {
    Row: MovimientoInventario;
    Insert: Omit<MovimientoInventario, "id" | "created_at"> & Partial<Pick<MovimientoInventario, "id" | "created_at">>;
    Update: Partial<MovimientoInventario>;
  };
};
