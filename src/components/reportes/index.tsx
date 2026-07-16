import { FileBarChart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ReportesModule() {
  return (
    <>
      <EmptyState
        icon={FileBarChart}
        title="Reportes"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
