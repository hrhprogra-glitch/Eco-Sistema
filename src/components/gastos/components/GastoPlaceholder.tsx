import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function GastoPlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["gastos"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
