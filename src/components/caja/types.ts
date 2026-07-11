export type MovimientoCaja = {
  id: string;
  fecha: string;
  concepto: string;
  tipo: "ingreso" | "egreso";
  monto: number;
  saldo: number;
  created_at: string;
};

export type CajaTables = {
  movimientos_caja: {
    Row: MovimientoCaja;
    Insert: Omit<MovimientoCaja, "id" | "created_at"> & Partial<Pick<MovimientoCaja, "id" | "created_at">>;
    Update: Partial<MovimientoCaja>;
  };
};
