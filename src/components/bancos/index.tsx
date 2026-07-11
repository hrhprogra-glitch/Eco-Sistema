import { Landmark } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function BancosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Landmark}
        title="Bancos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
