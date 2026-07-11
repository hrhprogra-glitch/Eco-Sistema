import { Car } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function VehiculosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Car}
        title="Vehículos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
