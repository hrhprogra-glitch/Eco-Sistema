import { BookUser } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function ContactoModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={BookUser}
        title="Clientes y contactos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
