import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function ConfiguracionPlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["configuraciones"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
