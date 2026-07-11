import { Package } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function InventarioModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Package}
        title="Inventario"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
