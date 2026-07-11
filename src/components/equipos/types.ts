export type Equipo = {
  id: string;
  nombre: string;
  categoria: string | null;
  estado: "activo" | "en_mantenimiento" | "de_baja";
  created_at: string;
};

export type EquiposTables = {
  equipos: {
    Row: Equipo;
    Insert: Omit<Equipo, "id" | "created_at"> & Partial<Pick<Equipo, "id" | "created_at">>;
    Update: Partial<Equipo>;
  };
};
