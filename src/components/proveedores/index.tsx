import { Truck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ProveedoresModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Truck}
        title="Proveedores"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
