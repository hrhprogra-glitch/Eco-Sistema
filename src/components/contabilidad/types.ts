export type ContabilidadVista = "resumen" | "diario" | "mayor" | "balance" | "plan_cuentas";

export type TipoCuenta = "activo" | "pasivo" | "patrimonio" | "ingreso" | "gasto";

export type CuentaContable = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  created_at: string;
};

export type EstadoAsiento = "borrador" | "confirmado";

export type AsientoLinea = {
  id: number;
  asiento_id: number;
  cuenta_id: number;
  debe: number;
  haber: number;
  descripcion: string | null;
  created_at: string;
  cuenta_codigo?: string;
  cuenta_nombre?: string;
};

export type AsientoContable = {
  id: number;
  fecha: string;
  descripcion: string;
  estado: EstadoAsiento;
  created_at: string;
  lineas: AsientoLinea[];
};

export type ContabilidadTables = {
  plan_cuentas: {
    Row: CuentaContable;
    Insert: Omit<CuentaContable, "id" | "created_at"> & Partial<Pick<CuentaContable, "id" | "created_at">>;
    Update: Partial<CuentaContable>;
  };
  asientos_contables: {
    Row: Omit<AsientoContable, "lineas">;
    Insert: { fecha: string; descripcion: string; lineas: { cuenta_id: number; debe: number; haber: number; descripcion?: string | null }[] };
    Update: Partial<Pick<AsientoContable, "estado">>;
  };
};
