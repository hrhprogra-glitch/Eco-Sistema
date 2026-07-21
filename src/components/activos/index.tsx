"use client";

import { useEffect, useState } from "react";
import { Car, HardHat, Plus, Wrench, AlertTriangle } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Activo, EstadoActivo, TipoActivo } from "./types";
import { ActivoForm } from "./ActivoForm";
import { MantenimientoForm } from "./MantenimientoForm";
import { useSession } from "@/components/session/SessionProvider";

const TIPO_VEHICULO_LABEL: Record<string, string> = {
  auto: "Auto",
  camioneta: "Camioneta",
  camion: "Camión",
  moto: "Moto",
  otro: "Otro",
};

const ESTADO_LABEL: Record<EstadoActivo, string> = {
  disponible: "Disponible",
  en_uso: "En uso",
  mantenimiento: "Mantenimiento",
  baja: "De baja",
};

type FiltroTipo = "todos" | "vehiculo" | "herramientas";

function diasHasta(fecha: string | null | undefined): number | null {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = new Date(fecha);
  objetivo.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
}

function nivelAlerta(fecha: string | null | undefined): "vencido" | "proximo" | null {
  const dias = diasHasta(fecha);
  if (dias === null) return null;
  if (dias < 0) return "vencido";
  if (dias <= 30) return "proximo";
  return null;
}

function tieneAlerta(activo: Activo): boolean {
  return nivelAlerta(activo.proximo_mantenimiento) !== null || nivelAlerta(activo.soat_vencimiento) !== null;
}

function FechaConAlerta({ fecha, vencidoLabel, proximoLabel }: { fecha: string | null | undefined; vencidoLabel: string; proximoLabel: string }) {
  if (!fecha) return <span style={{ color: "var(--text-secondary)" }}>—</span>;
  const nivel = nivelAlerta(fecha);
  const texto = new Date(fecha).toLocaleDateString();
  if (!nivel) return <span>{texto}</span>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: nivel === "vencido" ? "var(--status-error)" : "var(--status-warning)",
        fontWeight: 600,
      }}
      title={nivel === "vencido" ? vencidoLabel : proximoLabel}
    >
      <AlertTriangle size={13} />
      {texto}
    </span>
  );
}

export default function ActivosModule() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<
    | { mode: "list" }
    | { mode: "form"; activo?: Activo; tipoDefecto: TipoActivo }
    | { mode: "mantenimiento" }
  >({ mode: "list" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [filterTipo, setFilterTipo] = useState<FiltroTipo>("todos");
  const [filterEstado, setFilterEstado] = useState<EstadoActivo | "todos">("todos");
  const [soloAlertas, setSoloAlertas] = useState(false);
  const { permisos } = useSession();

  async function loadActivos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/activos");
      if (!res.ok) throw new Error("No se pudieron cargar los activos.");
      setActivos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivos();
  }, []);

  const filtrados = activos.filter((a) => {
    if (filterTipo === "vehiculo" && a.tipo !== "vehiculo") return false;
    if (filterTipo === "herramientas" && a.tipo === "vehiculo") return false;
    if (filterEstado !== "todos" && a.estado !== filterEstado) return false;
    if (soloAlertas && !tieneAlerta(a)) return false;
    if (
      searchTerm &&
      !a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(a.identificador && a.identificador.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    if (selectedLetter !== "0-9") {
      const inicial = a.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

  const columns: Column<Activo>[] = [
    { key: "nombre", header: "Nombre", render: (a) => <span style={{ fontWeight: 600 }}>{a.nombre}</span> },
    {
      key: "tipo",
      header: "Tipo",
      render: (a) => (a.tipo === "vehiculo" ? TIPO_VEHICULO_LABEL[a.tipo_vehiculo || ""] || "Vehículo" : a.tipo === "herramienta" ? "Herramienta" : "Equipo"),
    },
    { key: "identificador", header: "Placa / Serie", render: (a) => a.identificador || "—" },
    {
      key: "estado",
      header: "Estado",
      render: (a) => (
        <span
          style={{
            color:
              a.estado === "disponible"
                ? "var(--status-success)"
                : a.estado === "mantenimiento"
                  ? "var(--status-warning)"
                  : a.estado === "baja"
                    ? "var(--status-error)"
                    : "inherit",
          }}
        >
          {ESTADO_LABEL[a.estado]}
        </span>
      ),
    },
    {
      key: "proximo_mantenimiento",
      header: "Próximo mantenimiento",
      render: (a) => <FechaConAlerta fecha={a.proximo_mantenimiento} vencidoLabel="Mantenimiento vencido" proximoLabel="Mantenimiento próximo" />,
    },
    {
      key: "soat_vencimiento",
      header: "SOAT",
      render: (a) =>
        a.tipo === "vehiculo" ? (
          <FechaConAlerta fecha={a.soat_vencimiento} vencidoLabel="SOAT vencido" proximoLabel="SOAT por vencer" />
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>—</span>
        ),
    },
  ];

  const actions: ModuleAction[] = ([
    { key: "nuevo-vehiculo", label: "Nuevo Vehículo", icon: Car, tone: "primary", onClick: () => setView({ mode: "form", tipoDefecto: "vehiculo" }) },
    { key: "nueva-herramienta", label: "Nueva Herramienta / Equipo", icon: HardHat, onClick: () => setView({ mode: "form", tipoDefecto: "herramienta" }) },
    { key: "nuevo-mantenimiento", label: "Registrar Mantenimiento", icon: Wrench, onClick: () => setView({ mode: "mantenimiento" }) },
  ] as ModuleAction[]).filter(action => permisos.includes(`activos.${action.key}`));

  const sidebarContent = (
    <>
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>
      <FilterSection title="Filtros">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Tipo
            <select className={fieldStyles.input} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as FiltroTipo)}>
              <option value="todos">Todos</option>
              <option value="vehiculo">Vehículos</option>
              <option value="herramientas">Herramientas y equipos</option>
            </select>
          </label>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Estado
            <select className={fieldStyles.input} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as EstadoActivo | "todos")}>
              <option value="todos">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="en_uso">En uso</option>
              <option value="mantenimiento">En mantenimiento</option>
              <option value="baja">De baja</option>
            </select>
          </label>
          <label className={fieldStyles.checkboxRow}>
            <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />
            Solo con alertas (mantenimiento o SOAT)
          </label>
        </div>
      </FilterSection>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre o placa..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Car size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Activos</h1>
          </div>

          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(activo) => setView({ mode: "form", activo, tipoDefecto: activo.tipo })}
            emptyMessage={loading ? "Cargando activos..." : "No hay activos registrados."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <ActivoForm
          activo={view.activo}
          tipoDefecto={view.tipoDefecto}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadActivos();
          }}
        />
      )}

      {view.mode === "mantenimiento" && (
        <MantenimientoForm
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadActivos();
          }}
        />
      )}
    </div>
  );
}
