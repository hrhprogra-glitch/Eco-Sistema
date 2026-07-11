export type Exportacion = {
  id: string;
  nombre_archivo: string;
  modulo_origen: string;
  formato: "pdf" | "excel" | "csv";
  estado: "pendiente" | "lista" | "error";
  generado_por: string;
  generado_en: string | null;
  created_at: string;
};

export type ExportacionesTables = {
  exportaciones: {
    Row: Exportacion;
    Insert: Omit<Exportacion, "id" | "created_at"> & Partial<Pick<Exportacion, "id" | "created_at">>;
    Update: Partial<Exportacion>;
  };
};
