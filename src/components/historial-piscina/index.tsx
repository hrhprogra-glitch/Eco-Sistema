import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function HistorialPiscinaModule() {
  return (
    <>
      <EmptyState
        icon={History}
        title="Historial"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
