// Tipos de resultado para los cinco reportes contables (libros/estados) que
// consumen /api/contabilidad/{libro-diario,libro-mayor,balance-comprobacion,
// flujo-efectivo,cambios-patrimonio}. `types.ts` (CuentaContable, AsientoContable,
// etc.) sigue siendo la fuente de verdad para las entidades base — este archivo
// solo agrega las formas de respuesta propias de cada reporte.
import type { CuentaContable, TipoCuenta } from "./types";

// ---------------------------------------------------------------------------
// Libro Mayor
// ---------------------------------------------------------------------------

export type MovimientoMayor = {
  asiento_id: string;
  numero: number;
  fecha: string;
  asiento_descripcion: string;
  linea_descripcion: string | null;
  debe: number;
  haber: number;
  /** Saldo acumulado después de este movimiento. */
  saldo: number;
};

export type LibroMayorResponse = {
  cuenta: CuentaContable;
  desde: string | null;
  hasta: string | null;
  saldo_inicial: number;
  saldo_final: number;
  movimientos: MovimientoMayor[];
};

// ---------------------------------------------------------------------------
// Balance de Comprobación
// ---------------------------------------------------------------------------

export type BalanceComprobacionFila = {
  cuenta_id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  total_debe: number;
  total_haber: number;
  /** debe - haber en cuentas deudoras (activo/gasto); haber - debe en acreedoras. */
  saldo: number;
};

export type BalanceComprobacionResponse = {
  desde: string | null;
  hasta: string | null;
  filas: BalanceComprobacionFila[];
  totales: { total_debe: number; total_haber: number };
};

// ---------------------------------------------------------------------------
// Estado de Flujo de Efectivo
// ---------------------------------------------------------------------------

export type CuentaEfectivo = {
  cuenta_id: string;
  codigo: string;
  nombre: string;
};

export type MovimientoEfectivo = {
  asiento_id: string;
  numero: number;
  fecha: string;
  descripcion: string;
  cuenta_codigo: string;
  cuenta_nombre: string;
  debe: number;
  haber: number;
};

export type FlujoEfectivoResponse = {
  desde: string | null;
  hasta: string | null;
  cuentas: CuentaEfectivo[];
  entradas: number;
  salidas: number;
  neto: number;
  movimientos: MovimientoEfectivo[];
};

// ---------------------------------------------------------------------------
// Estado de Cambios en el Patrimonio
// ---------------------------------------------------------------------------

export type CambioPatrimonioFila = {
  cuenta_id: string;
  codigo: string;
  nombre: string;
  saldo_inicial: number;
  movimiento_neto: number;
  saldo_final: number;
};

export type CambiosPatrimonioResponse = {
  desde: string | null;
  hasta: string | null;
  filas: CambioPatrimonioFila[];
  totales: { saldo_inicial: number; movimiento_neto: number; saldo_final: number };
};
