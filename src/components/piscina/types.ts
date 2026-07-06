export type EstadoPiscina = "operativa" | "mantenimiento" | "cerrada";

export type Piscina = {
  id: number;
  contacto_id: number;
  contacto_nombre: string;
  nombre: string;
  ubicacion: string;
  volumen_m3: number;
  estado: EstadoPiscina;
  nivel_cloro: number | null;
  notas: string;
  created_at: string;
};

export type PiscinaInput = {
  contacto_id: number;
  nombre: string;
  ubicacion: string;
  volumen_m3: number;
  estado: EstadoPiscina;
  nivel_cloro: number | null;
  notas: string;
};

export type PiscinaTables = {
  piscinas: {
    Row: Piscina;
    Insert: PiscinaInput;
    Update: Partial<PiscinaInput>;
  };
};
