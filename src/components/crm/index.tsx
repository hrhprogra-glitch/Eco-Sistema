import { Handshake } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function CrmModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Handshake}
        title="CRM"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
