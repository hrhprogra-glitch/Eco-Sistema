import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function CajaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Wallet}
        title="Caja"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
