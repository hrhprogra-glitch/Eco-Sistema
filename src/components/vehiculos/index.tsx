import { Car } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function VehiculosModule() {
  return (
    <>
      <EmptyState
        icon={Car}
        title="Vehículos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
