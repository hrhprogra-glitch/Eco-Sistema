export type MantenimientoPiscina = {
  id: string;
  piscina: string;
  descripcion: string;
  fecha: string;
  created_at: string;
};

export type MantenimientosPiscinaTables = {
  mantenimientos_piscina: {
    Row: MantenimientoPiscina;
    Insert: Omit<MantenimientoPiscina, "id" | "created_at"> & Partial<Pick<MantenimientoPiscina, "id" | "created_at">>;
    Update: Partial<MantenimientoPiscina>;
  };
};
