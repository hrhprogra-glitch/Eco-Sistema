import { Plug } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function IntegracionesModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Plug}
        title="Integraciones"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
