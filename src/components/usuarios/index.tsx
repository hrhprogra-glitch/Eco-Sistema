import { UserCog } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function UsuariosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={UserCog}
        title="Usuarios"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
