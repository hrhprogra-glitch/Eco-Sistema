export type EstadoPiscina = "operativa" | "mantenimiento" | "cerrada";
export type FrecuenciaPiscina = "semanal" | "quincenal";

export type Piscina = {
  id: number;
  contacto_id: number;
  contacto_nombre: string;
  nombre: string;
  ubicacion: string;
  estado: EstadoPiscina;
  notas: string;
  frecuencia: FrecuenciaPiscina;
  precio_mantenimiento: number;
  created_at: string;
};

export type PiscinaInput = {
  contacto_id: number;
  nombre: string;
  ubicacion: string;
  estado: EstadoPiscina;
  notas: string;
  frecuencia: FrecuenciaPiscina;
  precio_mantenimiento: number;
};

export type PiscinaMaterial = {
  id: number;
  piscina_id: number;
  nombre_material: string;
  cantidad: number;
  monto: number;
  fecha: string;
  notas: string;
  created_at: string;
};

export type PiscinaMaterialInput = {
  nombre_material: string;
  cantidad: number;
  monto: number;
  fecha: string;
  notas: string;
};

export type PiscinaPago = {
  id: number;
  piscina_id: number;
  piscina_nombre: string;
  contacto_nombre: string;
  monto: number;
  periodo_inicio: string;
  periodo_fin: string;
  pagado: boolean;
  fecha_pago: string | null;
  notas: string;
  created_at: string;
};

export type PiscinaPagoInput = {
  piscina_id: number;
  monto: number;
  periodo_inicio: string;
  periodo_fin: string;
  pagado: boolean;
  fecha_pago: string | null;
  notas: string;
};

export type PiscinaTables = {
  piscinas: {
    Row: Piscina;
    Insert: PiscinaInput;
    Update: Partial<PiscinaInput>;
  };
  piscina_materiales: {
    Row: PiscinaMaterial;
    Insert: PiscinaMaterialInput & { piscina_id: number };
    Update: Partial<PiscinaMaterialInput>;
  };
  piscina_pagos: {
    Row: PiscinaPago;
    Insert: PiscinaPagoInput;
    Update: Partial<PiscinaPagoInput>;
  };
};

export type PiscinaConsumo = {
  id: number;
  piscina_id: number;
  producto_id: number | null;
  nombre_externo: string | null;
  cantidad: number;
  notas: string | null;
  created_at: string;
  producto_nombre?: string;
};

export type PiscinaConsumoInput = {
  producto_id: number | null;
  nombre_externo: string | null;
  cantidad: number;
  notas: string | null;
};
