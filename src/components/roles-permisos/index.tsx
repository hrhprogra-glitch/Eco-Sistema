import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function RolesPermisosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={ShieldCheck}
        title="Roles y Permisos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
