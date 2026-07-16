-- Reemplaza el campo de texto libre "trabajadores" de calendario_eventos por una
-- relacion real con empleados (mismo patron many-to-many que proyecto_empleados),
-- y agrega el estado "seguimiento" para marcar trabajos que se hicieron pero
-- necesitan una vuelta (mantenimiento pendiente).

BEGIN;

CREATE TABLE calendario_evento_empleados (
  evento_id UUID NOT NULL REFERENCES calendario_eventos(id) ON DELETE CASCADE,
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  PRIMARY KEY (evento_id, empleado_id)
);

ALTER TABLE calendario_eventos DROP COLUMN trabajadores;

ALTER TABLE calendario_eventos DROP CONSTRAINT calendario_eventos_estado_check;
ALTER TABLE calendario_eventos ADD CONSTRAINT calendario_eventos_estado_check
  CHECK (estado IN ('pendiente', 'completado', 'seguimiento', 'cancelado'));

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR UPDATE OR DELETE ON calendario_evento_empleados
  FOR EACH ROW EXECUTE FUNCTION sync_outbox_capture();

COMMIT;
