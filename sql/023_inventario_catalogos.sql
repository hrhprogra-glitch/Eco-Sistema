-- Catalogos base del modulo Inventario: proveedores (necesario como FK de Entradas),
-- almacenes (una sola fila sembrada por ahora, sin sesion de gestion propia todavia) y
-- lotes (todo producto con rastrear_inventario = true maneja su stock por lote, aunque
-- sea un lote generico sin fecha de vencimiento real).
--
-- Tambien pone al dia sql/ con columnas que la tabla productos real ya tiene en la base
-- (vende, compra, es_gasto) pero que ninguna migracion versionada agrego nunca -- el
-- ADD COLUMN IF NOT EXISTS es idempotente, no rompe nada si ya existen.
--
-- Nota: estas tablas nuevas NO llevan trg_sync_outbox a proposito -- el motor de sync
-- (src/lib/sync) ya viene fallando contra tablas que existen localmente pero no del lado
-- cloud (ver "oportunidades"); agregar mas tablas al outbox sin la contraparte en el
-- Supabase remoto solo sumaria mas errores al mismo problema. Si mas adelante se quiere
-- sincronizar Inventario, hay que agregarlas ahi (src/lib/sync/config.ts) y crear las
-- tablas del lado cloud primero.

BEGIN;

CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  ruc VARCHAR(20),
  contacto VARCHAR(150),
  telefono VARCHAR(30),
  email VARCHAR(150),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE almacenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO almacenes (nombre) VALUES ('Almacén Principal');

CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id),
  almacen_id UUID NOT NULL REFERENCES almacenes(id),
  numero_lote VARCHAR(50),
  cantidad_inicial NUMERIC(12,2) NOT NULL,
  cantidad_actual NUMERIC(12,2) NOT NULL,
  costo_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha_vencimiento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON lotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE productos ADD COLUMN IF NOT EXISTS vende BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS compra BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS es_gasto BOOLEAN NOT NULL DEFAULT false;

COMMIT;
