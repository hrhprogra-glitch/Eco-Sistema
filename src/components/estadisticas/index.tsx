import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function EstadisticasModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={BarChart3}
        title="Estadísticas"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
