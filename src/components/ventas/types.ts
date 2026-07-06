export type Venta = {
  id: string;
  cliente: string;
  total: number;
  estado: "borrador" | "confirmada" | "facturada";
  created_at: string;
};

export type VentasTables = {
  ventas: {
    Row: Venta;
    Insert: Omit<Venta, "id" | "created_at"> & Partial<Pick<Venta, "id" | "created_at">>;
    Update: Partial<Venta>;
  };
};
