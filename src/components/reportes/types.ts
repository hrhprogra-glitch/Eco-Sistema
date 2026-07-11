export type Reporte = {
  id: string;
  nombre: string;
  modulo_origen: string;
  formato: "pdf" | "excel" | "csv";
  generado_por: string;
  generado_en: string;
  created_at: string;
};

export type ReportesTables = {
  reportes: {
    Row: Reporte;
    Insert: Omit<Reporte, "id" | "created_at"> & Partial<Pick<Reporte, "id" | "created_at">>;
    Update: Partial<Reporte>;
  };
};
