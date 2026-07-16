-- Permite elegir entre Soles (PEN) y Dolares (USD) en una cotizacion, para reflejarlo
-- en la previsualizacion/PDF (antes siempre mostraba "U$" fijo).

BEGIN;

ALTER TABLE cotizaciones ADD COLUMN moneda VARCHAR(3) NOT NULL DEFAULT 'PEN'
  CHECK (moneda IN ('PEN', 'USD'));

COMMIT;
