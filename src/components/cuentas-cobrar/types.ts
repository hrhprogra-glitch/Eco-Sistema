export type CuentaPorCobrar = {
  id: string;
  cliente: string;
  concepto: string;
  monto: number;
  fecha_vencimiento: string;
  estado: "pendiente" | "cobrada" | "vencida";
  created_at: string;
};

export type CuentasCobrarTables = {
  cuentas_por_cobrar: {
    Row: CuentaPorCobrar;
    Insert: Omit<CuentaPorCobrar, "id" | "created_at"> & Partial<Pick<CuentaPorCobrar, "id" | "created_at">>;
    Update: Partial<CuentaPorCobrar>;
  };
};
