-- El Postgres local le faltaban 'tipo' y 'trabajadores' en calendario_eventos,
-- que ya existian en Supabase (el modulo de calendario las usa en
-- src/components/calendario/types.ts). Reconciliar el esquema local.

BEGIN;

ALTER TABLE calendario_eventos
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'nota',
  ADD COLUMN IF NOT EXISTS trabajadores TEXT;

COMMIT;
