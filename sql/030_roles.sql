-- Catálogo de roles (primer corte): lista manejable de roles con una descripción libre
-- de lo que puede hacer cada uno y una lista de "permisos" en texto libre (etiquetas,
-- no un motor de permisos real). No hay enforcement en el resto de la app todavía y
-- esta tabla es standalone: no referencia a "usuarios" (ese módulo lo está construyendo
-- otro agente en paralelo; el link usuario_id -> rol_id se agrega más adelante).
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
