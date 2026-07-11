import { Wrench } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function MantenimientosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Wrench}
        title="Mantenimientos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
