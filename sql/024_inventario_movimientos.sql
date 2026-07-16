-- Entradas (factura de proveedor, cabecera + lineas -- mismo patron que facturas/
-- factura_lineas) y movimientos_stock (el "cuaderno": registro cronologico unico de toda
-- entrada/salida/ajuste de stock, con su lote y motivo). Confirmar una entrada es lo que
-- realmente genera/incrementa el lote y el movimiento -- mientras esta en "borrador" no
-- afecta stock, igual que una cotizacion sin confirmar.

BEGIN;

CREATE TABLE entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL,
  proveedor_id UUID NOT NULL REFERENCES proveedores(id),
  numero_factura_proveedor VARCHAR(50),
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'confirmada', 'cancelada')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entrada_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id UUID NOT NULL REFERENCES entradas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  almacen_id UUID NOT NULL REFERENCES almacenes(id),
  cantidad NUMERIC(12,2) NOT NULL,
  costo_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  fecha_vencimiento DATE
);

CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id),
  almacen_id UUID NOT NULL REFERENCES almacenes(id),
  lote_id UUID REFERENCES lotes(id),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad NUMERIC(12,2) NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  entrada_id UUID REFERENCES entradas(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON entradas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_movimientos_stock_producto ON movimientos_stock (producto_id, fecha DESC);
CREATE INDEX idx_lotes_producto_almacen ON lotes (producto_id, almacen_id);

COMMIT;
