export type Configuracion = {
  id: string;
  clave: string;
  valor: string;
  descripcion: string;
  created_at: string;
};

export type ConfiguracionesTables = {
  configuraciones: {
    Row: Configuracion;
    Insert: Omit<Configuracion, "id" | "created_at"> & Partial<Pick<Configuracion, "id" | "created_at">>;
    Update: Partial<Configuracion>;
  };
};
