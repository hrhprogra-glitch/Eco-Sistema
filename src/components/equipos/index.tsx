import { HardHat } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function EquiposModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={HardHat}
        title="Equipos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
