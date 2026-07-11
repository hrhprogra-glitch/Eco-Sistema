export type RegistroAuditoria = {
  id: string;
  usuario: string;
  accion: "crear" | "modificar" | "eliminar" | "iniciar_sesion" | "cerrar_sesion";
  entidad: string;
  entidad_id: string | null;
  detalle: string | null;
  fecha: string;
  created_at: string;
};

export type AuditoriaTables = {
  auditoria: {
    Row: RegistroAuditoria;
    Insert: Omit<RegistroAuditoria, "id" | "created_at"> & Partial<Pick<RegistroAuditoria, "id" | "created_at">>;
    Update: Partial<RegistroAuditoria>;
  };
};
