import { ArrowUpFromLine } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CuentasPagarModule() {
  return (
    <>
      <EmptyState
        icon={ArrowUpFromLine}
        title="Cuentas por pagar"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
