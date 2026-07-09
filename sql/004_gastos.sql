CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  concepto VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  monto NUMERIC(12, 2) NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
  notas TEXT,
  comprobante_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
