-- El motor de sync (src/lib/sync/worker.ts) filtra CADA tabla por updated_at al traer
-- cambios de la nube, pero a estas 5 tablas de detalle/línea nunca se les agregó esa
-- columna cuando se crearon -por eso el sync fallaba siempre apenas llegaba a la
-- primera de la lista (cotizacion_lineas), disparando un reintento fallido de varios
-- segundos en cada tick, incluido el que corre apenas arranca el servidor.

BEGIN;

ALTER TABLE cotizacion_lineas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pedido_lineas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE factura_lineas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE factura_pagos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE calendario_evento_empleados ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_set_updated_at ON cotizacion_lineas;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON cotizacion_lineas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at ON pedido_lineas;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON pedido_lineas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at ON factura_lineas;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON factura_lineas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at ON factura_pagos;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON factura_pagos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at ON calendario_evento_empleados;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON calendario_evento_empleados
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
