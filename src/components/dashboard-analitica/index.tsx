import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function DashboardAnaliticaModule() {
  return (
    <>
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
