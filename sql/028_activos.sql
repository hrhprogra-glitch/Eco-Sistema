CREATE TABLE IF NOT EXISTS activos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- 'vehiculo', 'equipo', 'herramienta'
  nombre VARCHAR(255) NOT NULL,
  identificador VARCHAR(100), -- placa, nro serie, codigo interno
  estado VARCHAR(50) NOT NULL DEFAULT 'disponible', -- disponible, en_uso, mantenimiento, baja
  fecha_adquisicion DATE,
  asignado_a UUID REFERENCES empleados(id) ON DELETE SET NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mantenimientos_activos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  tipo_mantenimiento VARCHAR(50) NOT NULL, -- preventivo, correctivo
  fecha_programada DATE,
  fecha_realizada DATE,
  costo NUMERIC(12, 2),
  descripcion TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pendiente, completado, cancelado
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

