import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function OrdenesTrabajoModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={ClipboardCheck}
        title="Órdenes de Trabajo"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
