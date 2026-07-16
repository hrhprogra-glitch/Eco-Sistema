import { Download } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ExportacionesModule() {
  return (
    <>
      <EmptyState
        icon={Download}
        title="Exportaciones"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
