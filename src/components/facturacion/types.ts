export type Factura = {
  id: string;
  numero: string;
  cliente: string;
  total: number;
  estado: "pendiente" | "pagada" | "vencida";
  created_at: string;
};

export type FacturacionTables = {
  facturas: {
    Row: Factura;
    Insert: Omit<Factura, "id" | "created_at"> & Partial<Pick<Factura, "id" | "created_at">>;
    Update: Partial<Factura>;
  };
};
