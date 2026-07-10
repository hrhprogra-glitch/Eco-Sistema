-- Migra las tablas de negocio de id SERIAL a UUID y agrega updated_at,
-- como base para la sincronizacion bidireccional (local <-> Supabase).
--
-- Los UUID de las filas existentes se generan de forma DETERMINISTICA
-- (uuid_generate_v5 sobre 'tabla:id_viejo') para que, al correr este mismo
-- archivo en cada base (local A, local B, Supabase), la misma fila termine
-- con el mismo UUID en todos lados sin necesidad de copiar un mapeo entre
-- maquinas.
--
-- Este archivo debe correrse UNA VEZ en cada base de datos existente
-- (Postgres local de cada compu, y Supabase).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Namespace fijo, arbitrario pero constante entre todas las bases.
-- NO cambiar este valor.
-- (11111111-1111-1111-1111-111111111111)

-- ============================================================
-- 1) Apagar temporalmente el trigger de sync_outbox mientras
--    reescribimos ids, para no llenar la cola con ruido de la
--    migracion misma.
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'usuarios','empleados','productos','piscinas','piscina_consumos','gastos',
    'ventas','venta_lineas','plan_cuentas','asientos_contables','asiento_lineas',
    'calendario_eventos','contactos','proyectos','proyecto_items','proyecto_empleados',
    'piscina_materiales','piscina_pagos'
  ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_trigger tr JOIN pg_class c ON c.oid = tr.tgrelid
      WHERE c.relname = t AND tr.tgname = 'trg_sync_outbox'
    ) THEN
      EXECUTE format('ALTER TABLE %I DISABLE TRIGGER trg_sync_outbox', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 2) Agregar id_new UUID a cada tabla con id propio y poblarlo
--    de forma deterministica a partir del id SERIAL viejo.
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'usuarios','empleados','productos','piscinas','piscina_consumos','gastos',
    'ventas','venta_lineas','plan_cuentas','asientos_contables','asiento_lineas',
    'calendario_eventos','contactos','proyectos','proyecto_items',
    'piscina_materiales','piscina_pagos'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN id_new UUID', t);
    EXECUTE format(
      'UPDATE %I SET id_new = uuid_generate_v5(''11111111-1111-1111-1111-111111111111''::uuid, %L || '':'' || id::text)',
      t, t
    );
    EXECUTE format('ALTER TABLE %I ALTER COLUMN id_new SET NOT NULL', t);
  END LOOP;
END $$;

-- ============================================================
-- 3) Agregar columnas *_new UUID para cada FK y poblarlas
--    haciendo join contra el id_new de la tabla padre.
-- ============================================================

-- piscinas.contacto_id -> contactos
ALTER TABLE piscinas ADD COLUMN contacto_id_new UUID;
UPDATE piscinas p SET contacto_id_new = c.id_new FROM contactos c WHERE c.id = p.contacto_id;
ALTER TABLE piscinas ALTER COLUMN contacto_id_new SET NOT NULL;

-- piscina_consumos.piscina_id / producto_id
ALTER TABLE piscina_consumos ADD COLUMN piscina_id_new UUID;
UPDATE piscina_consumos pc SET piscina_id_new = p.id_new FROM piscinas p WHERE p.id = pc.piscina_id;
ALTER TABLE piscina_consumos ALTER COLUMN piscina_id_new SET NOT NULL;

ALTER TABLE piscina_consumos ADD COLUMN producto_id_new UUID;
UPDATE piscina_consumos pc SET producto_id_new = pr.id_new FROM productos pr WHERE pr.id = pc.producto_id;

-- piscina_materiales.piscina_id
ALTER TABLE piscina_materiales ADD COLUMN piscina_id_new UUID;
UPDATE piscina_materiales pm SET piscina_id_new = p.id_new FROM piscinas p WHERE p.id = pm.piscina_id;
ALTER TABLE piscina_materiales ALTER COLUMN piscina_id_new SET NOT NULL;

-- piscina_pagos.piscina_id
ALTER TABLE piscina_pagos ADD COLUMN piscina_id_new UUID;
UPDATE piscina_pagos pp SET piscina_id_new = p.id_new FROM piscinas p WHERE p.id = pp.piscina_id;
ALTER TABLE piscina_pagos ALTER COLUMN piscina_id_new SET NOT NULL;

-- ventas.contacto_id (sin FK declarada en DB, pero referencia logica)
ALTER TABLE ventas ADD COLUMN contacto_id_new UUID;
UPDATE ventas v SET contacto_id_new = c.id_new FROM contactos c WHERE c.id = v.contacto_id;
ALTER TABLE ventas ALTER COLUMN contacto_id_new SET NOT NULL;

-- venta_lineas.venta_id / producto_id
ALTER TABLE venta_lineas ADD COLUMN venta_id_new UUID;
UPDATE venta_lineas vl SET venta_id_new = v.id_new FROM ventas v WHERE v.id = vl.venta_id;
ALTER TABLE venta_lineas ALTER COLUMN venta_id_new SET NOT NULL;

ALTER TABLE venta_lineas ADD COLUMN producto_id_new UUID;
UPDATE venta_lineas vl SET producto_id_new = pr.id_new FROM productos pr WHERE pr.id = vl.producto_id;
ALTER TABLE venta_lineas ALTER COLUMN producto_id_new SET NOT NULL;

-- asiento_lineas.asiento_id / cuenta_id
ALTER TABLE asiento_lineas ADD COLUMN asiento_id_new UUID;
UPDATE asiento_lineas al SET asiento_id_new = a.id_new FROM asientos_contables a WHERE a.id = al.asiento_id;
ALTER TABLE asiento_lineas ALTER COLUMN asiento_id_new SET NOT NULL;

ALTER TABLE asiento_lineas ADD COLUMN cuenta_id_new UUID;
UPDATE asiento_lineas al SET cuenta_id_new = pc.id_new FROM plan_cuentas pc WHERE pc.id = al.cuenta_id;
ALTER TABLE asiento_lineas ALTER COLUMN cuenta_id_new SET NOT NULL;

-- calendario_eventos.piscina_id / proyecto_id (ambos nullable)
ALTER TABLE calendario_eventos ADD COLUMN piscina_id_new UUID;
UPDATE calendario_eventos ce SET piscina_id_new = p.id_new FROM piscinas p WHERE p.id = ce.piscina_id;

ALTER TABLE calendario_eventos ADD COLUMN proyecto_id_new UUID;
UPDATE calendario_eventos ce SET proyecto_id_new = pr.id_new FROM proyectos pr WHERE pr.id = ce.proyecto_id;

-- proyecto_items.proyecto_id / producto_id (ambos nullable)
ALTER TABLE proyecto_items ADD COLUMN proyecto_id_new UUID;
UPDATE proyecto_items pi SET proyecto_id_new = pr.id_new FROM proyectos pr WHERE pr.id = pi.proyecto_id;

ALTER TABLE proyecto_items ADD COLUMN producto_id_new UUID;
UPDATE proyecto_items pi SET producto_id_new = p.id_new FROM productos p WHERE p.id = pi.producto_id;

-- proyecto_empleados.proyecto_id / empleado_id (PK compuesta, NOT NULL)
ALTER TABLE proyecto_empleados ADD COLUMN proyecto_id_new UUID;
UPDATE proyecto_empleados pe SET proyecto_id_new = pr.id_new FROM proyectos pr WHERE pr.id = pe.proyecto_id;
ALTER TABLE proyecto_empleados ALTER COLUMN proyecto_id_new SET NOT NULL;

ALTER TABLE proyecto_empleados ADD COLUMN empleado_id_new UUID;
UPDATE proyecto_empleados pe SET empleado_id_new = e.id_new FROM empleados e WHERE e.id = pe.empleado_id;
ALTER TABLE proyecto_empleados ALTER COLUMN empleado_id_new SET NOT NULL;

-- ============================================================
-- 4) Tirar las FK viejas antes de poder tirar las PK viejas.
-- ============================================================
ALTER TABLE piscinas DROP CONSTRAINT piscinas_contacto_id_fkey;
ALTER TABLE piscina_consumos DROP CONSTRAINT piscina_consumos_piscina_id_fkey;
ALTER TABLE piscina_consumos DROP CONSTRAINT IF EXISTS piscina_consumos_producto_id_fkey;
ALTER TABLE piscina_materiales DROP CONSTRAINT piscina_materiales_piscina_id_fkey;
ALTER TABLE piscina_pagos DROP CONSTRAINT piscina_pagos_piscina_id_fkey;
ALTER TABLE venta_lineas DROP CONSTRAINT venta_lineas_venta_id_fkey;
ALTER TABLE asiento_lineas DROP CONSTRAINT asiento_lineas_asiento_id_fkey;
ALTER TABLE asiento_lineas DROP CONSTRAINT asiento_lineas_cuenta_id_fkey;
ALTER TABLE calendario_eventos DROP CONSTRAINT calendario_eventos_piscina_id_fkey;
ALTER TABLE calendario_eventos DROP CONSTRAINT calendario_eventos_proyecto_id_fkey;
ALTER TABLE proyecto_items DROP CONSTRAINT IF EXISTS proyecto_items_proyecto_id_fkey;
ALTER TABLE proyecto_items DROP CONSTRAINT IF EXISTS proyecto_items_producto_id_fkey;
ALTER TABLE proyecto_empleados DROP CONSTRAINT proyecto_empleados_proyecto_id_fkey;
ALTER TABLE proyecto_empleados DROP CONSTRAINT proyecto_empleados_empleado_id_fkey;

-- ============================================================
-- 5) Reemplazar id viejo por id_new en cada tabla padre y
--    convertirlo en la nueva PRIMARY KEY.
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'usuarios','empleados','productos','piscinas','piscina_consumos','gastos',
    'ventas','venta_lineas','plan_cuentas','asientos_contables','asiento_lineas',
    'calendario_eventos','contactos','proyectos','proyecto_items',
    'piscina_materiales','piscina_pagos'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, t || '_pkey');
    EXECUTE format('ALTER TABLE %I DROP COLUMN id', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN id_new TO id', t);
    EXECUTE format('ALTER TABLE %I ADD PRIMARY KEY (id)', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN id SET DEFAULT gen_random_uuid()', t);
  END LOOP;
END $$;

-- ============================================================
-- 6) Reemplazar cada columna FK vieja por su version _new y
--    renombrarla al nombre original.
-- ============================================================
ALTER TABLE piscinas DROP COLUMN contacto_id;
ALTER TABLE piscinas RENAME COLUMN contacto_id_new TO contacto_id;

ALTER TABLE piscina_consumos DROP COLUMN piscina_id;
ALTER TABLE piscina_consumos RENAME COLUMN piscina_id_new TO piscina_id;
ALTER TABLE piscina_consumos DROP COLUMN producto_id;
ALTER TABLE piscina_consumos RENAME COLUMN producto_id_new TO producto_id;

ALTER TABLE piscina_materiales DROP COLUMN piscina_id;
ALTER TABLE piscina_materiales RENAME COLUMN piscina_id_new TO piscina_id;

ALTER TABLE piscina_pagos DROP COLUMN piscina_id;
ALTER TABLE piscina_pagos RENAME COLUMN piscina_id_new TO piscina_id;

ALTER TABLE ventas DROP COLUMN contacto_id;
ALTER TABLE ventas RENAME COLUMN contacto_id_new TO contacto_id;

ALTER TABLE venta_lineas DROP COLUMN venta_id;
ALTER TABLE venta_lineas RENAME COLUMN venta_id_new TO venta_id;
ALTER TABLE venta_lineas DROP COLUMN producto_id;
ALTER TABLE venta_lineas RENAME COLUMN producto_id_new TO producto_id;

ALTER TABLE asiento_lineas DROP COLUMN asiento_id;
ALTER TABLE asiento_lineas RENAME COLUMN asiento_id_new TO asiento_id;
ALTER TABLE asiento_lineas DROP COLUMN cuenta_id;
ALTER TABLE asiento_lineas RENAME COLUMN cuenta_id_new TO cuenta_id;

ALTER TABLE calendario_eventos DROP COLUMN piscina_id;
ALTER TABLE calendario_eventos RENAME COLUMN piscina_id_new TO piscina_id;
ALTER TABLE calendario_eventos DROP COLUMN proyecto_id;
ALTER TABLE calendario_eventos RENAME COLUMN proyecto_id_new TO proyecto_id;

ALTER TABLE proyecto_items DROP COLUMN proyecto_id;
ALTER TABLE proyecto_items RENAME COLUMN proyecto_id_new TO proyecto_id;
ALTER TABLE proyecto_items DROP COLUMN producto_id;
ALTER TABLE proyecto_items RENAME COLUMN producto_id_new TO producto_id;

ALTER TABLE proyecto_empleados DROP COLUMN proyecto_id;
ALTER TABLE proyecto_empleados RENAME COLUMN proyecto_id_new TO proyecto_id;
ALTER TABLE proyecto_empleados DROP COLUMN empleado_id;
ALTER TABLE proyecto_empleados RENAME COLUMN empleado_id_new TO empleado_id;

-- ============================================================
-- 7) Volver a crear las FK y la PK compuesta de proyecto_empleados.
-- ============================================================
ALTER TABLE piscinas ADD CONSTRAINT piscinas_contacto_id_fkey
  FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE;

ALTER TABLE piscina_consumos ADD CONSTRAINT piscina_consumos_piscina_id_fkey
  FOREIGN KEY (piscina_id) REFERENCES piscinas(id) ON DELETE CASCADE;
ALTER TABLE piscina_consumos ADD CONSTRAINT piscina_consumos_producto_id_fkey
  FOREIGN KEY (producto_id) REFERENCES productos(id);

ALTER TABLE piscina_materiales ADD CONSTRAINT piscina_materiales_piscina_id_fkey
  FOREIGN KEY (piscina_id) REFERENCES piscinas(id) ON DELETE CASCADE;

ALTER TABLE piscina_pagos ADD CONSTRAINT piscina_pagos_piscina_id_fkey
  FOREIGN KEY (piscina_id) REFERENCES piscinas(id) ON DELETE CASCADE;

ALTER TABLE venta_lineas ADD CONSTRAINT venta_lineas_venta_id_fkey
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE;

ALTER TABLE asiento_lineas ADD CONSTRAINT asiento_lineas_asiento_id_fkey
  FOREIGN KEY (asiento_id) REFERENCES asientos_contables(id) ON DELETE CASCADE;
ALTER TABLE asiento_lineas ADD CONSTRAINT asiento_lineas_cuenta_id_fkey
  FOREIGN KEY (cuenta_id) REFERENCES plan_cuentas(id);

ALTER TABLE calendario_eventos ADD CONSTRAINT calendario_eventos_piscina_id_fkey
  FOREIGN KEY (piscina_id) REFERENCES piscinas(id) ON DELETE CASCADE;
ALTER TABLE calendario_eventos ADD CONSTRAINT calendario_eventos_proyecto_id_fkey
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL;

ALTER TABLE proyecto_items ADD CONSTRAINT proyecto_items_proyecto_id_fkey
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
ALTER TABLE proyecto_items ADD CONSTRAINT proyecto_items_producto_id_fkey
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL;

ALTER TABLE proyecto_empleados ADD PRIMARY KEY (proyecto_id, empleado_id);
ALTER TABLE proyecto_empleados ADD CONSTRAINT proyecto_empleados_proyecto_id_fkey
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
ALTER TABLE proyecto_empleados ADD CONSTRAINT proyecto_empleados_empleado_id_fkey
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE;

-- ============================================================
-- 8) updated_at + trigger que lo mantiene al dia, en todas las
--    tablas de negocio (incluida proyecto_empleados).
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'usuarios','empleados','productos','piscinas','piscina_consumos','gastos',
    'ventas','venta_lineas','plan_cuentas','asientos_contables','asiento_lineas',
    'calendario_eventos','contactos','proyectos','proyecto_items','proyecto_empleados',
    'piscina_materiales','piscina_pagos'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- 9) Columna 'numero' de exhibicion (secuencial, no es la PK)
--    para no romper los codigos ASI-00007 / S00xxx que ya
--    se ven en pantalla.
-- ============================================================
ALTER TABLE asientos_contables ADD COLUMN IF NOT EXISTS numero BIGSERIAL;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS numero BIGSERIAL;

-- ============================================================
-- 10) Reactivar el trigger de sync_outbox.
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'usuarios','empleados','productos','piscinas','piscina_consumos','gastos',
    'ventas','venta_lineas','plan_cuentas','asientos_contables','asiento_lineas',
    'calendario_eventos','contactos','proyectos','proyecto_items','proyecto_empleados',
    'piscina_materiales','piscina_pagos'
  ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_trigger tr JOIN pg_class c ON c.oid = tr.tgrelid
      WHERE c.relname = t AND tr.tgname = 'trg_sync_outbox'
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE TRIGGER trg_sync_outbox', t);
    END IF;
  END LOOP;
END $$;

COMMIT;
