export type AsientoContable = {
  id: string;
  cuenta: string;
  debe: number;
  haber: number;
  fecha: string;
  created_at: string;
};

export type ContabilidadTables = {
  asientos_contables: {
    Row: AsientoContable;
    Insert: Omit<AsientoContable, "id" | "created_at"> & Partial<Pick<AsientoContable, "id" | "created_at">>;
    Update: Partial<AsientoContable>;
  };
};
