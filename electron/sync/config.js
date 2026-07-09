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

module.exports.SYNC_INTERVAL_MS = 20000;
module.exports.MAX_ATTEMPTS = 5;
module.exports.BATCH_SIZE = 500;
