import { ArrowDownToLine } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CuentasCobrarModule() {
  return (
    <>
      <EmptyState
        icon={ArrowDownToLine}
        title="Cuentas por cobrar"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
