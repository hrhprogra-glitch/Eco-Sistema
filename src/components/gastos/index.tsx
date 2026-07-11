import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function GastosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={CreditCard}
        title="Gastos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
