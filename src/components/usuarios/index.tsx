import { UserCog } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function UsuariosModule() {
  return (
    <>
      <EmptyState
        icon={UserCog}
        title="Usuarios"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
