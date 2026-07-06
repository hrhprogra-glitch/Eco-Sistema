export type Oportunidad = {
  id: string;
  titulo: string;
  contacto: string;
  etapa: "nuevo" | "calificado" | "propuesta" | "ganado" | "perdido";
  monto_estimado: number;
  created_at: string;
};

export type CrmTables = {
  oportunidades: {
    Row: Oportunidad;
    Insert: Omit<Oportunidad, "id" | "created_at"> & Partial<Pick<Oportunidad, "id" | "created_at">>;
    Update: Partial<Oportunidad>;
  };
};
