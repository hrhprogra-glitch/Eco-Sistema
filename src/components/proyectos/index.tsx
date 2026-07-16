import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ProyectosModule() {
  return (
    <>
      <EmptyState
        icon={FolderKanban}
        title="Proyectos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
