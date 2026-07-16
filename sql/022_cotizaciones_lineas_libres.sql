-- Cotizaciones importadas desde Word ya no se mapean al modelo de tarjetas
-- (lineas_detalle): el usuario edita el contenido importado directo sobre la hoja, como
-- texto libre por fila (igual que Ecosistema-Document), sin forzarlo a los campos rígidos
-- de Producto/Descripción. lineas_modo indica cuál de los dos modelos usa cada cotización;
-- lineas_libres guarda las filas de texto libre cuando el modo es 'libre'.
ALTER TABLE cotizaciones ADD COLUMN lineas_modo TEXT NOT NULL DEFAULT 'tarjetas';
ALTER TABLE cotizaciones ADD COLUMN lineas_libres JSONB;
