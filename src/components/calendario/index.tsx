import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function CalendarioModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={CalendarDays}
        title="Calendario"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
