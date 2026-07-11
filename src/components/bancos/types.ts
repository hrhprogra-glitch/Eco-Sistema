export type CuentaBancaria = {
  id: string;
  banco: string;
  numero_cuenta: string;
  moneda: string;
  saldo: number;
  created_at: string;
};

export type BancosTables = {
  cuentas_bancarias: {
    Row: CuentaBancaria;
    Insert: Omit<CuentaBancaria, "id" | "created_at"> & Partial<Pick<CuentaBancaria, "id" | "created_at">>;
    Update: Partial<CuentaBancaria>;
  };
};
