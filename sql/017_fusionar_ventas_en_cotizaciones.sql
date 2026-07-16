-- Ventas se fusiona con Cotizaciones: ya no es una sesion aparte, sino un estado mas
-- dentro del mismo ciclo de vida de una cotizacion (confirmar = "se vendio", descuenta
-- stock; cancelar/revertir = deshace esa venta y devuelve el stock).
--
-- ventas/venta_lineas estaban vacias (sin datos reales) al momento de esta migracion,
-- asi que se eliminan sin necesidad de migrar filas.

BEGIN;

ALTER TABLE cotizaciones DROP CONSTRAINT cotizaciones_estado_check;
ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_estado_check
  CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada', 'confirmada', 'cancelada'));

DROP TABLE IF EXISTS venta_lineas;
DROP TABLE IF EXISTS ventas;

COMMIT;
