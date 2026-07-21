export type Rol = {
  id: string;
  nombre: string;
  descripcion: string | null;
  permisos: string[] | null;
  created_at: string;
  updated_at: string;
};
