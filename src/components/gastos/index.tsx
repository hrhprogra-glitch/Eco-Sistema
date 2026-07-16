import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function GastosModule() {
  return (
    <>
      <EmptyState
        icon={CreditCard}
        title="Gastos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
