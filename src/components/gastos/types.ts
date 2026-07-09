export type Gasto = {
  id: number;
  concepto: string;
  categoria: string;
  monto: number;
  fecha: string;
  estado: "pendiente" | "pagado";
  notas: string | null;
  comprobante_url: string | null;
  created_at: string;
};

export type GastosTables = {
  gastos: {
    Row: Gasto;
    Insert: Omit<Gasto, "id" | "created_at"> & Partial<Pick<Gasto, "id" | "created_at">>;
    Update: Partial<Gasto>;
  };
};
