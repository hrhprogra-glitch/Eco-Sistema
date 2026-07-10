const singleId = ["id"];

module.exports.PRIMARY_KEYS = {
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
module.exports.PULL_TABLE_ORDER = [
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

module.exports.SYNC_INTERVAL_MS = 20000;
module.exports.MAX_ATTEMPTS = 5;
module.exports.BATCH_SIZE = 500;
module.exports.PULL_BATCH_SIZE = 500;
