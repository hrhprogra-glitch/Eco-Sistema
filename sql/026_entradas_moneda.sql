-- Permite elegir entre Soles (PEN) y Dolares (USD) en una entrada (factura de compra),
-- mismo patron que cotizaciones (ver 019_cotizaciones_moneda.sql). El costo unitario
-- cargado en la entrada se entiende siempre sin IGV.

BEGIN;

ALTER TABLE entradas ADD COLUMN moneda VARCHAR(3) NOT NULL DEFAULT 'PEN'
  CHECK (moneda IN ('PEN', 'USD'));

COMMIT;
