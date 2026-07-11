import { Download } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ExportacionesModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Download}
        title="Exportaciones"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
