import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function AuditoriaModule() {
  return (
    <>
      <EmptyState
        icon={History}
        title="Auditoría"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
