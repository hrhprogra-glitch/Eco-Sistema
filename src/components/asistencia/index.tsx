import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function AsistenciaModule() {
  return (
    <>
      <EmptyState
        icon={CalendarCheck}
        title="Asistencia"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
