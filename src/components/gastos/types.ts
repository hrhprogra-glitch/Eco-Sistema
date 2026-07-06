export type Gasto = {
  id: string;
  concepto: string;
  monto: number;
  categoria: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  created_at: string;
};

export type GastosTables = {
  gastos: {
    Row: Gasto;
    Insert: Omit<Gasto, "id" | "created_at"> & Partial<Pick<Gasto, "id" | "created_at">>;
    Update: Partial<Gasto>;
  };
};
