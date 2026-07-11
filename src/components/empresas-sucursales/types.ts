export type Empresa = {
  id: string;
  nombre: string;
  ruc: string | null;
  created_at: string;
};

export type Sucursal = {
  id: string;
  empresa_id: string;
  nombre: string;
  direccion: string | null;
  created_at: string;
};

export type EmpresasSucursalesTables = {
  empresas: {
    Row: Empresa;
    Insert: Omit<Empresa, "id" | "created_at"> & Partial<Pick<Empresa, "id" | "created_at">>;
    Update: Partial<Empresa>;
  };
  sucursales: {
    Row: Sucursal;
    Insert: Omit<Sucursal, "id" | "created_at"> & Partial<Pick<Sucursal, "id" | "created_at">>;
    Update: Partial<Sucursal>;
  };
};
