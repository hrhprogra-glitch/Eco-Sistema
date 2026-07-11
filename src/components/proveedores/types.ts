export type Proveedor = {
  id: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  created_at: string;
};

export type ProveedoresTables = {
  proveedores: {
    Row: Proveedor;
    Insert: Omit<Proveedor, "id" | "created_at"> & Partial<Pick<Proveedor, "id" | "created_at">>;
    Update: Partial<Proveedor>;
  };
};
