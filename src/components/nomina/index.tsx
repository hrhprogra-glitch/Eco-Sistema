import { Banknote } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function NominaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Banknote}
        title="Nómina"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
