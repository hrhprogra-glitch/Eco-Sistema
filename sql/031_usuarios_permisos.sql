-- 1. Añadimos la columna permisos a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS permisos TEXT[] DEFAULT '{}';

-- 2. Ya no usaremos la tabla roles, así que la eliminamos
DROP TABLE IF EXISTS roles;
