import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ProyectosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={FolderKanban}
        title="Proyectos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
