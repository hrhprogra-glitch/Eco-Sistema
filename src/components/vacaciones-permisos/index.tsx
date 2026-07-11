import { Palmtree } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function VacacionesPermisosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Palmtree}
        title="Vacaciones y Permisos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
