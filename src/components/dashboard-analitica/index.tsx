import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ModuleRibbon } from "@/components/ui/ModuleRibbon";

export default function DashboardAnaliticaModule() {
  return (
    <>
      <ModuleRibbon />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
