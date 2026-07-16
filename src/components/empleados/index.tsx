import { Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function EmpleadosModule() {
  return (
    <>
      <EmptyState
        icon={Users}
        title="Empleados"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
