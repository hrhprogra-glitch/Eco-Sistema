export type ReciboNomina = {
  id: string;
  empleado: string;
  periodo: string;
  salario_bruto: number;
  descuentos: number;
  salario_neto: number;
  fecha_pago: string | null;
  estado: "pendiente" | "pagado";
  created_at: string;
};

export type NominaTables = {
  nomina: {
    Row: ReciboNomina;
    Insert: Omit<ReciboNomina, "id" | "created_at"> & Partial<Pick<ReciboNomina, "id" | "created_at">>;
    Update: Partial<ReciboNomina>;
  };
};
