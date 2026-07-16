import { Mail } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CorreoModule() {
  return (
    <>
      <EmptyState
        icon={Mail}
        title="Correo electrónico"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
