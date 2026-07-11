import { Warehouse } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function AlmacenesModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Warehouse}
        title="Almacenes"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
