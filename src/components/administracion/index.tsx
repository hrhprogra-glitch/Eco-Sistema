import { useState } from "react";
import { Users, UserCog, ShieldCheck } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import EmpleadosModule from "@/components/empleados";
import UsuariosModule from "@/components/usuarios";
import RolesPermisosModule from "@/components/roles-permisos";

type AdminView = "empleados" | "usuarios" | "roles";

export default function AdministracionModule() {
  const [activeView, setActiveView] = useState<AdminView>("empleados");

  const actions: ModuleAction[] = [
    { key: "empleados", label: "Empleados", icon: Users, onClick: () => setActiveView("empleados"), active: activeView === "empleados" },
    { key: "usuarios", label: "Usuarios del Sistema", icon: UserCog, onClick: () => setActiveView("usuarios"), active: activeView === "usuarios" },
    { key: "roles", label: "Roles y Permisos", icon: ShieldCheck, onClick: () => setActiveView("roles"), active: activeView === "roles" },
  ];

  const adminNavContent = (
    <FilterSection title="Vista">
      <ModuleActions actions={actions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {activeView === "empleados" && <EmpleadosModule adminNavContent={adminNavContent} />}
      {activeView === "usuarios" && <UsuariosModule adminNavContent={adminNavContent} />}
      {activeView === "roles" && <RolesPermisosModule adminNavContent={adminNavContent} />}
    </div>
  );
}
