import { Banknote } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function NominaModule() {
  return (
    <>
      <EmptyState
        icon={Banknote}
        title="Nómina"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
