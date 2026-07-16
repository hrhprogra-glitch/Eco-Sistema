-- Cada linea de cotizacion puede tener un encabezado/titulo propio (sin precio) que se
-- muestra arriba de su descripcion en la hoja/PDF -por ejemplo, agrupar varios repuestos
-- bajo un titulo como "INSTALACION ELECTRICA"-.

BEGIN;

ALTER TABLE cotizacion_lineas ADD COLUMN descripcion_superior TEXT;

COMMIT;
