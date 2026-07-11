import { Mail } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function CorreoModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={Mail}
        title="Correo electrónico"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
