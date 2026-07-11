export type Integracion = {
  id: string;
  nombre: string;
  proveedor: string;
  activa: boolean;
  created_at: string;
};

export type IntegracionesTables = {
  integraciones: {
    Row: Integracion;
    Insert: Omit<Integracion, "id" | "created_at"> & Partial<Pick<Integracion, "id" | "created_at">>;
    Update: Partial<Integracion>;
  };
};
