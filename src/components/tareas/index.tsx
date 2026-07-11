import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function TareasModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={CheckSquare}
        title="Tareas"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
