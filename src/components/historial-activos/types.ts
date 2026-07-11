export type EventoHistorialActivo = {
  id: string;
  activo: string;
  evento: string;
  fecha: string;
  created_at: string;
};

export type HistorialActivosTables = {
  historial_activos: {
    Row: EventoHistorialActivo;
    Insert: Omit<EventoHistorialActivo, "id" | "created_at"> & Partial<Pick<EventoHistorialActivo, "id" | "created_at">>;
    Update: Partial<EventoHistorialActivo>;
  };
};
