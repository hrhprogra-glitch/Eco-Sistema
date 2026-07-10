-- Solo se aplica en el Postgres LOCAL de cada compu (igual que sync_outbox/sync_state).
--
-- 1) sync_outbox_capture() ahora ignora los cambios que el propio proceso de
--    pull (Supabase -> local) esta aplicando, para no re-encolarlos y
--    empujarlos de vuelta a la nube en un loop inutil. El worker activa esto
--    con SET LOCAL app.sync_apply = 'on' dentro de la misma transaccion en
--    la que aplica una fila que bajo de Supabase.
--
-- 2) sync_state suma last_pull_at: hasta que timestamp (segun el reloj de
--    Supabase) ya se trajeron cambios en el ultimo pull.

BEGIN;

CREATE OR REPLACE FUNCTION sync_outbox_capture() RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.sync_apply', true) = 'on' THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD));
  ELSE
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE sync_state ADD COLUMN IF NOT EXISTS last_pull_at TIMESTAMPTZ NOT NULL DEFAULT '-infinity';

COMMIT;
