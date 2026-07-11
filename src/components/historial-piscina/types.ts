export type EventoHistorialPiscina = {
  id: string;
  piscina: string;
  evento: string;
  fecha: string;
  created_at: string;
};

export type HistorialPiscinaTables = {
  historial_piscina: {
    Row: EventoHistorialPiscina;
    Insert: Omit<EventoHistorialPiscina, "id" | "created_at"> & Partial<Pick<EventoHistorialPiscina, "id" | "created_at">>;
    Update: Partial<EventoHistorialPiscina>;
  };
};
