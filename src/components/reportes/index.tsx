import { FileBarChart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ReportesModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={FileBarChart}
        title="Reportes"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
