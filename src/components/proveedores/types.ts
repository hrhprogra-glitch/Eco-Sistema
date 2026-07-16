export type Proveedor = {
  id: string;
  nombre: string;
  ruc: string | null;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type ProveedoresTables = {
  proveedores: {
    Row: Proveedor;
    Insert: Omit<Proveedor, "id" | "created_at" | "updated_at"> & Partial<Pick<Proveedor, "id" | "created_at" | "updated_at">>;
    Update: Partial<Proveedor>;
  };
};
