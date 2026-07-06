import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function AsientoContablePlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["contabilidad"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
