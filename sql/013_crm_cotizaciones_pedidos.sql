-- CRM (oportunidades) y el flujo comercial previo a la venta: cotizaciones y pedidos.
-- Mismo patron que ventas/venta_lineas: cabecera + lineas, UUID desde el arranque,
-- updated_at + trg_set_updated_at, y trg_sync_outbox para el mecanismo de sync ya activo
-- en contactos/ventas/calendario_eventos.

BEGIN;

CREATE TABLE oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  etapa VARCHAR(20) NOT NULL DEFAULT 'nuevo'
    CHECK (etapa IN ('nuevo', 'calificado', 'propuesta', 'ganado', 'perdido')),
  monto_estimado NUMERIC(12,2) NOT NULL DEFAULT 0,
  notas TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL,
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cotizacion_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad NUMERIC(12,2) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL,
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_preparacion', 'enviado', 'entregado', 'cancelado')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedido_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad NUMERIC(12,2) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- updated_at automatico (la funcion set_updated_at() ya existe desde 009_uuid_bidireccional.sql)
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON oportunidades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- outbox de sincronizacion (la funcion sync_outbox_capture() ya existe desde 007_sync_outbox.sql)
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON oportunidades
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON cotizacion_lineas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON pedido_lineas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();

COMMIT;
