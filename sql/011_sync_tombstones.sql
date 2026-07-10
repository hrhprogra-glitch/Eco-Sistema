-- Solo se aplica en Supabase (la nube). Es el "hub": cuando una compu borra
-- una fila y la propaga a Supabase, ademas de borrarla ahi se deja un
-- registro en sync_tombstones para que las demas compus, en su proximo
-- pull, sepan que esa fila hay que borrarla tambien de su Postgres local
-- (una fila que ya no existe no aparece en un SELECT normal, por eso hace
-- falta este rastro aparte).
--
-- row_key es JSONB (no un UUID suelto) para soportar tanto tablas con PK
-- simple ({"id": "..."}) como la PK compuesta de proyecto_empleados
-- ({"proyecto_id": "...", "empleado_id": "..."}).

BEGIN;

DROP TABLE IF EXISTS sync_tombstones;

CREATE TABLE sync_tombstones (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_key JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_tombstones_deleted_at ON sync_tombstones (deleted_at);

COMMIT;
