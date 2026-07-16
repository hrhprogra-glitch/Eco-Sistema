import { Landmark } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function BancosModule() {
  return (
    <>
      <EmptyState
        icon={Landmark}
        title="Bancos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
