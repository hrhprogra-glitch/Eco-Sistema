import { Settings } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ConfiguracionesModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Settings}
        title="Configuración"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
