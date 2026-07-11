export type Tarea = {
  id: string;
  titulo: string;
  responsable: string | null;
  estado: "pendiente" | "en_progreso" | "completada";
  fecha_limite: string | null;
  created_at: string;
};

export type TareasTables = {
  tareas: {
    Row: Tarea;
    Insert: Omit<Tarea, "id" | "created_at"> & Partial<Pick<Tarea, "id" | "created_at">>;
    Update: Partial<Tarea>;
  };
};
