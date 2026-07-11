export type SolicitudVacacionesPermiso = {
  id: string;
  empleado: string;
  tipo: "vacaciones" | "permiso";
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string | null;
  estado: "pendiente" | "aprobado" | "rechazado";
  created_at: string;
};

export type VacacionesPermisosTables = {
  vacaciones_permisos: {
    Row: SolicitudVacacionesPermiso;
    Insert: Omit<SolicitudVacacionesPermiso, "id" | "created_at"> & Partial<Pick<SolicitudVacacionesPermiso, "id" | "created_at">>;
    Update: Partial<SolicitudVacacionesPermiso>;
  };
};
