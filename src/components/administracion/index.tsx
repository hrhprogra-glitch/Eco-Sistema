import { useState, useEffect } from "react";
import { Users, UserCog, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import EmpleadosModule from "@/components/empleados";
import UsuariosModule from "@/components/usuarios";
import PermisosUsuariosModule from "@/components/permisos-usuarios";

type AdminView = "empleados" | "usuarios" | "permisos";

export default function AdministracionModule() {
  const [activeView, setActiveView] = useState<AdminView>("empleados");
  const { permisos } = useSession();

  const actions: ModuleAction[] = [
    { key: "empleados", label: "Empleados", icon: Users, onClick: () => setActiveView("empleados"), active: activeView === "empleados" },
    { key: "usuarios", label: "Usuarios del Sistema", icon: UserCog, onClick: () => setActiveView("usuarios"), active: activeView === "usuarios" },
    { key: "permisos", label: "Permisos de Usuarios", icon: ShieldCheck, onClick: () => setActiveView("permisos"), active: activeView === "permisos" },
  ].filter(action => permisos.includes(`administracion.${action.key}`));

  useEffect(() => {
    if (actions.length > 0 && !actions.find(a => a.key === activeView)) {
      setActiveView(actions[0].key as AdminView);
    }
  }, [permisos, activeView, actions]);

  const adminNavContent = (
    <FilterSection title="Vista">
      <ModuleActions actions={actions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {activeView === "empleados" && <EmpleadosModule adminNavContent={adminNavContent} />}
      {activeView === "usuarios" && <UsuariosModule adminNavContent={adminNavContent} />}
      {activeView === "permisos" && <PermisosUsuariosModule adminNavContent={adminNavContent} />}
    </div>
  );
}
