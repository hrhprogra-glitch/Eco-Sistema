import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function TareasModule() {
  return (
    <>
      <EmptyState
        icon={CheckSquare}
        title="Tareas"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
