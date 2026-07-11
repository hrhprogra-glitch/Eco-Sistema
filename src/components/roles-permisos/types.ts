export type Rol = {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
};

export type RolesPermisosTables = {
  roles: {
    Row: Rol;
    Insert: Omit<Rol, "id" | "created_at"> & Partial<Pick<Rol, "id" | "created_at">>;
    Update: Partial<Rol>;
  };
};
