const singleId = ["id"];

export const PRIMARY_KEYS: Record<string, string[]> = {
  usuarios: singleId,
  empleados: singleId,
  productos: singleId,
  piscinas: singleId,
  piscina_consumos: singleId,
  gastos: singleId,
  ventas: singleId,
  venta_lineas: singleId,
  plan_cuentas: singleId,
  asientos_contables: singleId,
  asiento_lineas: singleId,
  calendario_eventos: singleId,
  contactos: singleId,
  proyectos: singleId,
  proyecto_items: singleId,
  proyecto_empleados: ["proyecto_id", "empleado_id"],
  piscina_materiales: singleId,
  piscina_pagos: singleId,
};

// Orden padre -> hijo, para que el pull inserte primero las filas que otras
// tablas referencian por FK (si no, una fila hija puede llegar antes de que
// exista su padre en este Postgres local y la foreign key la rechaza).
export const PULL_TABLE_ORDER = [
  "usuarios",
  "empleados",
  "productos",
  "contactos",
  "proyectos",
  "plan_cuentas",
  "gastos",
  "piscinas",
  "asientos_contables",
  "ventas",
  "piscina_consumos",
  "piscina_materiales",
  "piscina_pagos",
  "calendario_eventos",
  "proyecto_items",
  "proyecto_empleados",
  "venta_lineas",
  "asiento_lineas",
];

export const SYNC_INTERVAL_MS = 20000;
export const MAX_ATTEMPTS = 5;
export const BATCH_SIZE = 500;
export const PULL_BATCH_SIZE = 500;
