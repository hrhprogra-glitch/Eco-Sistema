import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CajaModule() {
  return (
    <>
      <EmptyState
        icon={Wallet}
        title="Caja"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
