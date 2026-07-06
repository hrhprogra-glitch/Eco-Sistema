import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function FacturaPlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["facturacion"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
