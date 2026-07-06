import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function MensajePlaceholder() {
  return (
    <EmptyState
      icon={moduleIcons["correo"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
