-- Las lineas de una cotizacion pasan a guardarse como un solo JSONB (lineas_detalle) en
-- vez de filas normalizadas en cotizacion_lineas: la estructura de una linea cambio
-- varias veces en poco tiempo (texto libre, encabezado, ahora tarjetas con varios
-- productos + precio general), y cada cambio de forma exigia una migracion nueva de
-- columnas. Un JSONB evita eso mientras la forma siga evolucionando.
--
-- cotizacion_lineas no se borra (por si se necesita mirar historial viejo), pero deja de
-- usarse desde la API: todo se lee/escribe en cotizaciones.lineas_detalle de aca en mas.

BEGIN;

ALTER TABLE cotizaciones ADD COLUMN lineas_detalle JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMIT;
