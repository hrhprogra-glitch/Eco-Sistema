import { Waves } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function PiscinaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Waves}
        title="Piscina"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
