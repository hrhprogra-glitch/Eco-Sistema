export type Almacen = {
  id: string;
  nombre: string;
  ubicacion: string | null;
  created_at: string;
};

export type AlmacenesTables = {
  almacenes: {
    Row: Almacen;
    Insert: Omit<Almacen, "id" | "created_at"> & Partial<Pick<Almacen, "id" | "created_at">>;
    Update: Partial<Almacen>;
  };
};
