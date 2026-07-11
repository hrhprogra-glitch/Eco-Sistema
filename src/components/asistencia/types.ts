export type Asistencia = {
  id: string;
  empleado: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  estado: "presente" | "ausente" | "tarde" | "permiso";
  created_at: string;
};

export type AsistenciaTables = {
  asistencia: {
    Row: Asistencia;
    Insert: Omit<Asistencia, "id" | "created_at"> & Partial<Pick<Asistencia, "id" | "created_at">>;
    Update: Partial<Asistencia>;
  };
};
