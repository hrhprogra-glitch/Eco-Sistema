ALTER TABLE piscinas
  ADD COLUMN IF NOT EXISTS frecuencia VARCHAR(20) NOT NULL DEFAULT 'semanal',
  ADD COLUMN IF NOT EXISTS precio_mantenimiento NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE piscinas
  ADD CONSTRAINT piscinas_frecuencia_check
  CHECK (frecuencia IN ('semanal', 'quincenal'));

CREATE TABLE IF NOT EXISTS piscina_consumos (
  id SERIAL PRIMARY KEY,
  piscina_id INTEGER NOT NULL REFERENCES piscinas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  nombre_externo TEXT,
  cantidad INTEGER NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
