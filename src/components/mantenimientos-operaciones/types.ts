export type MantenimientoOperacion = {
  id: string;
  descripcion: string;
  responsable: string | null;
  fecha: string;
  estado: "pendiente" | "en_proceso" | "completado";
  created_at: string;
};

export type MantenimientosOperacionesTables = {
  mantenimientos_operaciones: {
    Row: MantenimientoOperacion;
    Insert: Omit<MantenimientoOperacion, "id" | "created_at"> & Partial<Pick<MantenimientoOperacion, "id" | "created_at">>;
    Update: Partial<MantenimientoOperacion>;
  };
};
