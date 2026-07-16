import { Calculator } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ContabilidadModule() {
  return (
    <>
      <EmptyState
        icon={Calculator}
        title="Contabilidad"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
