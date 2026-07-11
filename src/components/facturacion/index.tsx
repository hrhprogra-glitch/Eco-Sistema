import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function FacturacionModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Receipt}
        title="Facturación"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
