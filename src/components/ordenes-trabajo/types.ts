export type OrdenTrabajo = {
  id: string;
  numero: string;
  descripcion: string;
  estado: "abierta" | "en_proceso" | "cerrada";
  created_at: string;
};

export type OrdenesTrabajoTables = {
  ordenes_trabajo: {
    Row: OrdenTrabajo;
    Insert: Omit<OrdenTrabajo, "id" | "created_at"> & Partial<Pick<OrdenTrabajo, "id" | "created_at">>;
    Update: Partial<OrdenTrabajo>;
  };
};
