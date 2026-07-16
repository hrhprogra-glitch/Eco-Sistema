import { HardHat } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function EquiposPiscinaModule() {
  return (
    <>
      <EmptyState
        icon={HardHat}
        title="Equipos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
