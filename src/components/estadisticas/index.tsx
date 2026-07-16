import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function EstadisticasModule() {
  return (
    <>
      <EmptyState
        icon={BarChart3}
        title="Estadísticas"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
