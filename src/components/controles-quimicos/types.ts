export type ControlQuimico = {
  id: string;
  piscina: string;
  ph: number | null;
  cloro: number | null;
  fecha: string;
  created_at: string;
};

export type ControlesQuimicosTables = {
  controles_quimicos: {
    Row: ControlQuimico;
    Insert: Omit<ControlQuimico, "id" | "created_at"> & Partial<Pick<ControlQuimico, "id" | "created_at">>;
    Update: Partial<ControlQuimico>;
  };
};
