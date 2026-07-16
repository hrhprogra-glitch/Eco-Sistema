import { Target } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function KpisModule() {
  return (
    <>
      <EmptyState
        icon={Target}
        title="Indicadores (KPIs)"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
