-- Modulo de Facturacion: cabecera + lineas (mismo patron que cotizaciones/pedidos) mas
-- una tabla de pagos para llevar el saldo pendiente de cada factura. cotizacion_id es
-- opcional: permite generar la factura a partir de una cotizacion aceptada, copiando
-- cliente y lineas, sin obligar a que toda factura venga de una cotizacion previa.

BEGIN;

CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL,
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  cotizacion_id UUID REFERENCES cotizaciones(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'enviada', 'pagada', 'vencida')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE factura_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  descripcion TEXT,
  cantidad NUMERIC(12,2) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  CONSTRAINT factura_lineas_producto_o_descripcion CHECK (producto_id IS NOT NULL OR descripcion IS NOT NULL)
);

CREATE TABLE factura_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo VARCHAR(30),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON facturas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON facturas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON factura_lineas
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();
CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON factura_pagos
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();

COMMIT;
