import { ArrowDownToLine } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function CuentasCobrarModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={ArrowDownToLine}
        title="Cuentas por cobrar"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
