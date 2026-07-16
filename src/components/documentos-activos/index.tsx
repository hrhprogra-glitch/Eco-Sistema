import { FolderArchive } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function DocumentosActivosModule() {
  return (
    <>
      <EmptyState
        icon={FolderArchive}
        title="Documentos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
