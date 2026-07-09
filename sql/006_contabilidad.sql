CREATE TABLE IF NOT EXISTS plan_cuentas (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asientos_contables (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'confirmado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asiento_lineas (
  id SERIAL PRIMARY KEY,
  asiento_id INTEGER NOT NULL REFERENCES asientos_contables(id) ON DELETE CASCADE,
  cuenta_id INTEGER NOT NULL REFERENCES plan_cuentas(id),
  debe NUMERIC(14, 2) NOT NULL DEFAULT 0,
  haber NUMERIC(14, 2) NOT NULL DEFAULT 0,
  descripcion VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asiento_lineas_asiento ON asiento_lineas(asiento_id);
CREATE INDEX IF NOT EXISTS idx_asiento_lineas_cuenta ON asiento_lineas(cuenta_id);

-- Plan de cuentas inicial (mínimo viable, estilo Odoo)
INSERT INTO plan_cuentas (codigo, nombre, tipo) VALUES
  ('1000', 'Caja', 'activo'),
  ('1010', 'Bancos', 'activo'),
  ('1020', 'Cuentas por Cobrar', 'activo'),
  ('1030', 'Inventario de Mercaderías', 'activo'),
  ('1040', 'Activos Fijos', 'activo'),
  ('2000', 'Cuentas por Pagar', 'pasivo'),
  ('2010', 'Impuestos por Pagar', 'pasivo'),
  ('2020', 'Préstamos por Pagar', 'pasivo'),
  ('3000', 'Capital Social', 'patrimonio'),
  ('3010', 'Resultados Acumulados', 'patrimonio'),
  ('4000', 'Ventas', 'ingreso'),
  ('4010', 'Otros Ingresos', 'ingreso'),
  ('5000', 'Costo de Ventas', 'gasto'),
  ('5010', 'Gastos Operativos', 'gasto'),
  ('5020', 'Gastos de Personal', 'gasto'),
  ('5030', 'Gastos Financieros', 'gasto')
ON CONFLICT (codigo) DO NOTHING;
