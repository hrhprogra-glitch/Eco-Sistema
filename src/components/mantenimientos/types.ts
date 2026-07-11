export type Mantenimiento = {
  id: string;
  activo: string;
  tipo: "preventivo" | "correctivo";
  fecha: string;
  costo: number | null;
  created_at: string;
};

export type MantenimientosTables = {
  mantenimientos: {
    Row: Mantenimiento;
    Insert: Omit<Mantenimiento, "id" | "created_at"> & Partial<Pick<Mantenimiento, "id" | "created_at">>;
    Update: Partial<Mantenimiento>;
  };
};
