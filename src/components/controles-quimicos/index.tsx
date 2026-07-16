import { FlaskConical } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ControlesQuimicosModule() {
  return (
    <>
      <EmptyState
        icon={FlaskConical}
        title="Controles Químicos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
