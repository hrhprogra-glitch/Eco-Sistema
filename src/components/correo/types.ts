export type Mensaje = {
  id: string;
  asunto: string;
  remitente: string;
  destinatario: string;
  leido: boolean;
  created_at: string;
};

export type CorreoTables = {
  mensajes: {
    Row: Mensaje;
    Insert: Omit<Mensaje, "id" | "created_at"> & Partial<Pick<Mensaje, "id" | "created_at">>;
    Update: Partial<Mensaje>;
  };
};
