export type CuentaPorPagar = {
  id: string;
  proveedor: string;
  concepto: string;
  monto: number;
  fecha_vencimiento: string;
  estado: "pendiente" | "pagada" | "vencida";
  created_at: string;
};

export type CuentasPagarTables = {
  cuentas_por_pagar: {
    Row: CuentaPorPagar;
    Insert: Omit<CuentaPorPagar, "id" | "created_at"> & Partial<Pick<CuentaPorPagar, "id" | "created_at">>;
    Update: Partial<CuentaPorPagar>;
  };
};
