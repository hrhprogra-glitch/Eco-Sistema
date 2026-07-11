export type EquipoPiscina = {
  id: string;
  nombre: string;
  piscina: string;
  estado: "activo" | "en_mantenimiento" | "de_baja";
  created_at: string;
};

export type EquiposPiscinaTables = {
  equipos_piscina: {
    Row: EquipoPiscina;
    Insert: Omit<EquipoPiscina, "id" | "created_at"> & Partial<Pick<EquipoPiscina, "id" | "created_at">>;
    Update: Partial<EquipoPiscina>;
  };
};
