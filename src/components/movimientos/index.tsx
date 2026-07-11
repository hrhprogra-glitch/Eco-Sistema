import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function MovimientosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={ArrowLeftRight}
        title="Movimientos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
