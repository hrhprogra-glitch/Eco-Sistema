export type DocumentoActivo = {
  id: string;
  activo: string;
  nombre_archivo: string;
  tipo: string | null;
  created_at: string;
};

export type DocumentosActivosTables = {
  documentos_activos: {
    Row: DocumentoActivo;
    Insert: Omit<DocumentoActivo, "id" | "created_at"> & Partial<Pick<DocumentoActivo, "id" | "created_at">>;
    Update: Partial<DocumentoActivo>;
  };
};
