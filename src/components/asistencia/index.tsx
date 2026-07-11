import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function AsistenciaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={CalendarCheck}
        title="Asistencia"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
