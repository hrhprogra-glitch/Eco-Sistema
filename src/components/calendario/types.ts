export type EstadoEvento = "pendiente" | "completado" | "seguimiento" | "cancelado";
export type TipoEvento = "nota" | "recordatorio" | "mantenimiento" | "visita" | "obra";

export type EventoCalendario = {
  id: string;
  titulo: string;
  fecha: string;
  descripcion: string | null;
  estado: EstadoEvento;
  tipo: TipoEvento;
  piscina_id: string | null;
  piscina_nombre: string | null;
  contacto_nombre: string | null;
  created_at: string;
};

export type EventoCalendarioInput = {
  titulo: string;
  fecha: string;
  descripcion: string | null;
  estado: EstadoEvento;
  tipo: TipoEvento;
  piscina_id: string | null;
};
