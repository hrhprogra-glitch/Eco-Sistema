import { Waves } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function PiscinaModule() {
  return (
    <>
      <EmptyState
        icon={Waves}
        title="Piscinas"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
