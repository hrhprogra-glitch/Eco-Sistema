CREATE TABLE piscina_materiales (
  id SERIAL PRIMARY KEY,
  piscina_id INTEGER NOT NULL REFERENCES piscinas(id) ON DELETE CASCADE,
  nombre_material VARCHAR(150) NOT NULL,
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  monto NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE piscina_pagos (
  id SERIAL PRIMARY KEY,
  piscina_id INTEGER NOT NULL REFERENCES piscinas(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL DEFAULT 0,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  pagado BOOLEAN NOT NULL DEFAULT false,
  fecha_pago DATE,
  notas TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON piscina_materiales
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON piscina_pagos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
