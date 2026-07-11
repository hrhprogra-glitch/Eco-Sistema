import { FlaskConical } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ControlesQuimicosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={FlaskConical}
        title="Controles Químicos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
