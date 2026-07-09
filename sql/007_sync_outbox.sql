-- Outbox para el motor de sincronizacion local -> Supabase.
-- Solo se aplica en el Postgres local: es el unico lado que genera cambios.

CREATE TABLE sync_outbox (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE INDEX idx_sync_outbox_pending ON sync_outbox (id) WHERE synced_at IS NULL;

CREATE TABLE sync_state (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_check_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ
);

INSERT INTO sync_state (id) VALUES (true);

CREATE OR REPLACE FUNCTION sync_outbox_capture() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD));
  ELSE
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON empleados
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON productos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON piscinas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON piscina_consumos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON gastos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON ventas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON venta_lineas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON plan_cuentas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON asientos_contables
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON asiento_lineas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON calendario_eventos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON contactos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON proyecto_items
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON proyecto_empleados
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
