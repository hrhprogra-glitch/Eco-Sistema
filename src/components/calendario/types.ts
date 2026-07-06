export type EstadoEvento = "pendiente" | "completado" | "cancelado";

export type EventoCalendario = {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string | null;
  estado: EstadoEvento;
  proyecto_id: number | null;
  proyecto_nombre: string | null;
  piscina_id: number | null;
  piscina_nombre: string | null;
  contacto_nombre: string | null;
  created_at: string;
};

export type EventoCalendarioInput = {
  titulo: string;
  fecha: string;
  descripcion: string | null;
  estado: EstadoEvento;
  proyecto_id: number | null;
  piscina_id: number | null;
};
