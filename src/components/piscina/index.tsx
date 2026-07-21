import { useState, useEffect } from "react";
import { Waves, Wrench, HardHat, History } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { EmptyState } from "@/components/EmptyState";
import { PiscinasVista } from "./components/PiscinasVista";

type PiscinaView = "piscinas" | "mantenimientos" | "equipos" | "historial";

export default function PiscinaModule() {
  const [activeView, setActiveView] = useState<PiscinaView>("piscinas");
  const { permisos } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [viewActions, setViewActions] = useState<ModuleAction[]>([]);

  const vistaActions: ModuleAction[] = [
    { 
      key: "piscinas", 
      label: "Piscinas", 
      icon: Waves, 
      active: activeView === "piscinas", 
      onClick: () => { setActiveView("piscinas"); setSearchTerm(""); setSelectedLetter("0-9"); } 
    },
    { 
      key: "mantenimientos", 
      label: "Mantenimientos", 
      icon: Wrench, 
      active: activeView === "mantenimientos", 
      onClick: () => { setActiveView("mantenimientos"); setSearchTerm(""); setSelectedLetter("0-9"); } 
    },
    { 
      key: "equipos", 
      label: "Equipos", 
      icon: HardHat, 
      active: activeView === "equipos", 
      onClick: () => { setActiveView("equipos"); setSearchTerm(""); setSelectedLetter("0-9"); } 
    },
    { 
      key: "historial", 
      label: "Historial", 
      icon: History, 
      active: activeView === "historial", 
      onClick: () => { setActiveView("historial"); setSearchTerm(""); setSelectedLetter("0-9"); } 
    }
  ].filter(action => permisos.includes(`piscina.${action.key}`));

  useEffect(() => {
    if (vistaActions.length > 0 && !vistaActions.find(a => a.key === activeView)) {
      setActiveView(vistaActions[0].key as PiscinaView);
    }
  }, [permisos, activeView, vistaActions]);

  const piscinaNavContent = (
    <FilterSection title="Vista">
      <ModuleActions actions={vistaActions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {activeView === "piscinas" && <PiscinasVista piscinaNavContent={piscinaNavContent} />}
      {activeView === "mantenimientos" && (
        <FilterLayout sidebarContent={piscinaNavContent}>
          <EmptyState
            icon={Wrench}
            title="Mantenimientos"
            description="Este módulo está en blanco, listo para empezar a construirlo."
          />
        </FilterLayout>
      )}
      {activeView === "equipos" && (
        <FilterLayout sidebarContent={piscinaNavContent}>
          <EmptyState
            icon={HardHat}
            title="Equipos"
            description="Este módulo está en blanco, listo para empezar a construirlo."
          />
        </FilterLayout>
      )}
      {activeView === "historial" && (
        <FilterLayout sidebarContent={piscinaNavContent}>
          <EmptyState
            icon={History}
            title="Historial"
            description="Este módulo está en blanco, listo para empezar a construirlo."
          />
        </FilterLayout>
      )}
    </div>
  );
}
