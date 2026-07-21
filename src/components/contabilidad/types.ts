export type ContabilidadVista =
  | "resumen"
  | "diario"
  | "mayor"
  | "balance"
  | "plan_cuentas"
  | "estado_resultados"
  | "balance_general";

export type TipoCuenta = "activo" | "pasivo" | "patrimonio" | "ingreso" | "gasto";

export type CuentaContable = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  created_at: string;
};

export type EstadoAsiento = "borrador" | "confirmado";

export type AsientoLinea = {
  id: string;
  asiento_id: string;
  cuenta_id: string;
  debe: number;
  haber: number;
  descripcion: string | null;
  created_at: string;
  cuenta_codigo?: string;
  cuenta_nombre?: string;
};

export type AsientoContable = {
  id: string;
  numero: number;
  fecha: string;
  descripcion: string;
  estado: EstadoAsiento;
  created_at: string;
  lineas: AsientoLinea[];
};

// --- Estado de Resultados (Income Statement) ---

export type LineaEstadoContable = {
  cuenta_id: string;
  codigo: string;
  nombre: string;
  monto: number;
};

export type EstadoResultados = {
  desde: string;
  hasta: string;
  ingresos: LineaEstadoContable[];
  gastos: LineaEstadoContable[];
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
};

// --- Estado de Situación Financiera / Balance General (Balance Sheet) ---

export type BalanceGeneral = {
  fecha: string;
  activos: LineaEstadoContable[];
  pasivos: LineaEstadoContable[];
  patrimonios: LineaEstadoContable[];
  totalActivo: number;
  totalPasivo: number;
  totalPatrimonio: number;
  // Utilidad calculada en vivo (ingresos - gastos confirmados desde el inicio hasta
  // "fecha") porque todavía no existe un mecanismo de cierre de periodo que la
  // traslade a Resultados Acumulados; se muestra como línea aparte bajo patrimonio.
  utilidadEjercicio: number;
  totalPasivoPatrimonio: number;
  cuadra: boolean;
};

export type ContabilidadTables = {
  plan_cuentas: {
    Row: CuentaContable;
    Insert: Omit<CuentaContable, "id" | "created_at"> & Partial<Pick<CuentaContable, "id" | "created_at">>;
    Update: Partial<CuentaContable>;
  };
  asientos_contables: {
    Row: Omit<AsientoContable, "lineas">;
    Insert: { fecha: string; descripcion: string; lineas: { cuenta_id: string; debe: number; haber: number; descripcion?: string | null }[] };
    Update: Partial<Pick<AsientoContable, "estado">>;
  };
};
