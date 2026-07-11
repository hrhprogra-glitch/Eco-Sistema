export type Usuario = {
  id: string;
  nombre: string;
  username: string;
  rol: string | null;
  activo: boolean;
  created_at: string;
};

export type UsuariosTables = {
  usuarios: {
    Row: Usuario;
    Insert: Omit<Usuario, "id" | "created_at"> & Partial<Pick<Usuario, "id" | "created_at">>;
    Update: Partial<Usuario>;
  };
};
