import { Plug } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function IntegracionesModule() {
  return (
    <>
      <EmptyState
        icon={Plug}
        title="Integraciones"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
