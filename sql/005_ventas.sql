CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  contacto_id INTEGER NOT NULL,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'confirmada', 'facturada', 'cancelada')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venta_lineas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
