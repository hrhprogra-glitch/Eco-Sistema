export type Estadistica = {
  id: string;
  nombre: string;
  valor: number;
  periodo: string;
  created_at: string;
};

export type EstadisticasTables = {
  estadisticas: {
    Row: Estadistica;
    Insert: Omit<Estadistica, "id" | "created_at"> & Partial<Pick<Estadistica, "id" | "created_at">>;
    Update: Partial<Estadistica>;
  };
};
