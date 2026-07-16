-- Permite que una linea de cotizacion no dependa de un producto real del inventario:
-- necesario para cotizaciones importadas desde un Word, donde la descripcion viene
-- como texto libre y puede no coincidir con ningun producto existente.

BEGIN;

ALTER TABLE cotizacion_lineas ALTER COLUMN producto_id DROP NOT NULL;
ALTER TABLE cotizacion_lineas ADD COLUMN descripcion TEXT;
ALTER TABLE cotizacion_lineas ADD CONSTRAINT cotizacion_lineas_producto_o_descripcion
  CHECK (producto_id IS NOT NULL OR descripcion IS NOT NULL);

COMMIT;
