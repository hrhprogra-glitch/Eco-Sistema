import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ComprasModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={ShoppingCart}
        title="Compras"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
