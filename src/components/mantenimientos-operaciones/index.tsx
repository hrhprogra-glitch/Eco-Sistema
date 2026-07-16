import { Wrench } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function MantenimientosOperacionesModule() {
  return (
    <>
      <EmptyState
        icon={Wrench}
        title="Mantenimientos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
