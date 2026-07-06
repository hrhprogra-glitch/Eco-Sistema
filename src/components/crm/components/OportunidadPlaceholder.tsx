import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function OportunidadPlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["crm"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
