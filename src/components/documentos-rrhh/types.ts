export type DocumentoEmpleado = {
  id: string;
  empleado: string;
  nombre_archivo: string;
  tipo: "contrato" | "identificacion" | "certificado" | "otro";
  fecha_carga: string;
  created_at: string;
};

export type DocumentosRrhhTables = {
  documentos_rrhh: {
    Row: DocumentoEmpleado;
    Insert: Omit<DocumentoEmpleado, "id" | "created_at"> & Partial<Pick<DocumentoEmpleado, "id" | "created_at">>;
    Update: Partial<DocumentoEmpleado>;
  };
};
