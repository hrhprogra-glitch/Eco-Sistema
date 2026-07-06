import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function VentaPlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["ventas"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
