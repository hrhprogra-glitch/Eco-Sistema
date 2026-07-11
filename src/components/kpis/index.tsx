import { Target } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function KpisModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Target}
        title="Indicadores (KPIs)"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
