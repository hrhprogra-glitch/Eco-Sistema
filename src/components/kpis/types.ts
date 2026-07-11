export type Indicador = {
  id: string;
  nombre: string;
  valor_actual: number;
  valor_objetivo: number;
  unidad: string;
  periodo: string;
  tendencia: "subida" | "bajada" | "estable";
  created_at: string;
};

export type KpisTables = {
  kpis: {
    Row: Indicador;
    Insert: Omit<Indicador, "id" | "created_at"> & Partial<Pick<Indicador, "id" | "created_at">>;
    Update: Partial<Indicador>;
  };
};
