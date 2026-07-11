import { Calculator } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ContabilidadModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Calculator}
        title="Contabilidad"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
