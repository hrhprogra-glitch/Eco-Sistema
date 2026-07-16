import { Settings } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ConfiguracionesModule() {
  return (
    <>
      <EmptyState
        icon={Settings}
        title="Configuración"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
