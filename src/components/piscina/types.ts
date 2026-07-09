export type EstadoPiscina = "operativa" | "mantenimiento" | "cerrada";
export type FrecuenciaPiscina = "semanal" | "quincenal";

export type Piscina = {
  id: number;
  contacto_id: number;
  contacto_nombre: string;
  nombre: string;
  ubicacion: string;
  estado: EstadoPiscina;
  notas: string;
  frecuencia: FrecuenciaPiscina;
  precio_mantenimiento: number;
  created_at: string;
};

export type PiscinaInput = {
  contacto_id: number;
  nombre: string;
  ubicacion: string;
  estado: EstadoPiscina;
  notas: string;
  frecuencia: FrecuenciaPiscina;
  precio_mantenimiento: number;
};

export type PiscinaTables = {
  piscinas: {
    Row: Piscina;
    Insert: PiscinaInput;
    Update: Partial<PiscinaInput>;
  };
};

export type PiscinaConsumo = {
  id: number;
  piscina_id: number;
  producto_id: number | null;
  nombre_externo: string | null;
  cantidad: number;
  notas: string | null;
  created_at: string;
  producto_nombre?: string;
};

export type PiscinaConsumoInput = {
  producto_id: number | null;
  nombre_externo: string | null;
  cantidad: number;
  notas: string | null;
};
