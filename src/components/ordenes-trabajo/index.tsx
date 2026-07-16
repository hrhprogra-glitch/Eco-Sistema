import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function OrdenesTrabajoModule() {
  return (
    <>
      <EmptyState
        icon={ClipboardCheck}
        title="Órdenes de Trabajo"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
