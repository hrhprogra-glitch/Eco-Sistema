export type Compra = {
  id: string;
  numero: string;
  proveedor: string;
  total: number;
  estado: "pendiente" | "recibida" | "cancelada";
  created_at: string;
};

export type ComprasTables = {
  compras: {
    Row: Compra;
    Insert: Omit<Compra, "id" | "created_at"> & Partial<Pick<Compra, "id" | "created_at">>;
    Update: Partial<Compra>;
  };
};
