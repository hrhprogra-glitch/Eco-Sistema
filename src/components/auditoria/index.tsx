import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function AuditoriaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={History}
        title="Auditoría"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
