-- Guarda la ruta del PDF de la factura/boleta importada en Compras (ver
-- src/components/compras/components/EntradaForm.tsx), asi al reabrir la entrada se puede
-- volver a ver el comprobante original -antes solo vivia como blob URL en el navegador y
-- se perdia al recargar la pagina o reabrir la compra.

BEGIN;

ALTER TABLE entradas ADD COLUMN factura_pdf_url VARCHAR(300);

COMMIT;
