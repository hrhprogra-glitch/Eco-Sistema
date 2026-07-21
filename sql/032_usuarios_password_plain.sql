-- Añadimos la columna password_plain a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255);
