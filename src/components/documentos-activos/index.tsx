import { FolderArchive } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function DocumentosActivosModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={FolderArchive}
        title="Documentos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
