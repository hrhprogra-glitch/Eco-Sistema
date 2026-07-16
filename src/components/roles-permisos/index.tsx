import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function RolesPermisosModule() {
  return (
    <>
      <EmptyState
        icon={ShieldCheck}
        title="Roles y Permisos"
        description="Este módulo está en blanco, listo para empezar a construirlo."
      />
    </>
  );
}
