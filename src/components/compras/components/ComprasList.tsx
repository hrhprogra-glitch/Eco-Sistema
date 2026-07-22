"use client";

import { useCallback, useEffect, useState } from "react";
import { FileInput, ShoppingCart, Truck, RotateCcw, Trash2 } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EntradaForm } from "./EntradaForm";
import { DevolverModal } from "./DevolverModal";
import { useSession } from "@/components/session/SessionProvider";
import type { Entrada } from "../types";
import type { ComprasVista } from "..";

type View = { mode: "list" } | { mode: "entrada"; entrada?: Entrada };

const ESTADO_LABEL: Record<Entrada["estado"], string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  devuelta: "Devuelta",
};

export function ComprasList({
  vista,
  onCambiarVista,
}: {
  vista?: ComprasVista;
  onCambiarVista?: (vista: ComprasVista) => void;
}) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [compras, setCompras] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Sin seleccionar");
  const [entradaDevolver, setEntradaDevolver] = useState<Entrada | null>(null);
  const { permisos } = useSession();

  const loadCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/entradas", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las compras.");
      setCompras(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompras();
  }, [loadCompras]);

  async function abrirCompra(resumen: Entrada) {
    const res = await fetch(`/api/entradas/${resumen.id}`);
    if (res.ok) {
      setView({ mode: "entrada", entrada: await res.json() });
    }
  }

  async function abrirDevolucion(resumen: Entrada) {
    const res = await fetch(`/api/entradas/${resumen.id}`);
    if (res.ok) {
      setEntradaDevolver(await res.json());
    }
  }

  async function eliminarCompra(entrada: Entrada) {
    // Para un borrador (nunca tocó stock) el aviso es simple. Para una compra ya
    // devuelta al 100% -el único otro caso en que esto queda habilitado- hay que dejar
    // claro que lo que se borra es el papeleo (la compra y su nota de crédito), porque el
    // stock y el lote que había ingresado ya se revirtieron al devolverla.
    const confirmado = window.confirm(
      entrada.estado === "borrador"
        ? `¿Eliminar este borrador de compra "${entrada.numero_factura_proveedor || entrada.numero}"? Esta acción no se puede deshacer.`
        : `¿Eliminar definitivamente la compra "${entrada.numero_factura_proveedor || entrada.numero}"?\n\n` +
          `Ya fue devuelta por completo, así que no afecta el stock actual. ` +
          `Esta acción borra también su nota de crédito y no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      const res = await fetch(`/api/entradas/${entrada.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la compra.");
      }
      loadCompras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    }
  }

  const columns: Column<Entrada>[] = [
    { key: "numero", header: "N°" },
    { key: "proveedor_nombre", header: "Proveedor (razón social)", render: (e) => e.proveedor_nombre || "—" },
    { key: "numero_factura_proveedor", header: "N° factura", render: (e) => e.numero_factura_proveedor || "—" },
    { key: "fecha", header: "Fecha de compra", render: (e) => e.fecha?.slice(0, 10) },
    {
      key: "estado",
      header: "Estado",
      render: (e) => (
        <span
          style={{
            color: e.estado === "confirmada" ? "var(--status-online)" : e.estado === "devuelta" ? "#f59e0b" : e.estado === "cancelada" ? "var(--status-error)" : "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          {ESTADO_LABEL[e.estado]}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total (sin IGV)",
      render: (e) => `${e.moneda === "USD" ? "US$" : "S/"} ${Number(e.total).toFixed(2)}`,
    },
    {
      key: "__acciones__" as any,
      header: "Acciones",
      render: (e: any) => {
        // Devolver y Eliminar van siempre los dos, uno al lado del otro -mismo criterio
        // que en el detalle de la compra (EntradaForm)-: nunca se esconden, solo se
        // deshabilita el que no corresponde en cada estado. Un borrador nunca tocó stock
        // -no hay nada que devolver todavía- y Eliminar solo sirve de verdad para un
        // borrador o una compra ya devuelta al 100% (ver eliminarCompra).
        const estaDeshabilitado = e.estado === "borrador" || Number(e.cantidad_disponible_devolucion) <= 0;
        const puedeEliminar = e.estado === "borrador" || e.estado === "devuelta";

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={(evt) => {
                evt.stopPropagation();
                if (!estaDeshabilitado) {
                  abrirDevolucion(e);
                }
              }}
              disabled={estaDeshabilitado}
              title={
                e.estado === "borrador"
                  ? "Un borrador todavía no tiene stock que devolver."
                  : estaDeshabilitado
                  ? "Ya se devolvió todo lo que ingresó esta compra."
                  : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: estaDeshabilitado ? "#9ca3af" : "#38bdf8",
                border: "none",
                borderRadius: "0px",
                cursor: estaDeshabilitado ? "not-allowed" : "pointer",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                boxShadow: estaDeshabilitado ? "none" : "0 2px 4px rgba(56, 189, 248, 0.4)",
                minWidth: "100px",
                opacity: estaDeshabilitado ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!estaDeshabilitado) {
                  e.currentTarget.style.backgroundColor = "#0ea5e9";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(56, 189, 248, 0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!estaDeshabilitado) {
                  e.currentTarget.style.backgroundColor = "#38bdf8";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(56, 189, 248, 0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
              onMouseDown={(e) => {
                if (!estaDeshabilitado) {
                  e.currentTarget.style.transform = "translateY(1px)";
                }
              }}
              onMouseUp={(e) => {
                if (!estaDeshabilitado) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
            >
              <RotateCcw size={16} />
              Devolver
            </button>

            <button
              onClick={(evt) => {
                evt.stopPropagation();
                if (puedeEliminar) eliminarCompra(e);
              }}
              disabled={!puedeEliminar}
              title={
                puedeEliminar
                  ? e.estado === "borrador"
                    ? "Eliminar borrador"
                    : "Eliminar compra devuelta por completo"
                  : "Primero tenés que devolver todo lo que ingresó esta compra."
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: `1px solid ${puedeEliminar ? "var(--status-error, #dc2626)" : "#9ca3af"}`,
                borderRadius: "0px",
                cursor: puedeEliminar ? "pointer" : "not-allowed",
                color: puedeEliminar ? "var(--status-error, #dc2626)" : "#9ca3af",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                opacity: puedeEliminar ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (puedeEliminar) {
                  e.currentTarget.style.backgroundColor = "var(--status-error, #dc2626)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (puedeEliminar) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--status-error, #dc2626)";
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const actions: ModuleAction[] = [
    { key: "nueva-compra", label: "Nueva compra", icon: FileInput, tone: "primary", onClick: () => setView({ mode: "entrada" }) },
  ];

  const vistaActions: ModuleAction[] = onCambiarVista
    ? [
        { key: "compras", label: "Compras", icon: ShoppingCart, active: vista === "compras", onClick: () => onCambiarVista("compras") },
        { key: "proveedores", label: "Proveedores", icon: Truck, active: vista === "proveedores", onClick: () => onCambiarVista("proveedores") },
      ].filter(action => permisos.includes(`compras.${action.key}`))
    : [];



  const comprasFiltradas = compras.filter((compra) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [compra.proveedor_nombre, compra.numero_factura_proveedor, String(compra.numero)]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    if (estadoFiltro !== "Sin seleccionar" && ESTADO_LABEL[compra.estado] !== estadoFiltro) return false;
    
    if (selectedLetter !== "0-9") {
      const inicial = (compra.proveedor_nombre || "").trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

  const sidebarContent = (
    <>
      {vistaActions.length > 0 && (
        <FilterSection title="Vista">
          <ModuleActions actions={vistaActions} variant="sidebar" />
        </FilterSection>
      )}

      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>

      <FilterSection title="Estado">
        {["Sin seleccionar", ...Object.values(ESTADO_LABEL)].map((estado) => (
          <label key={estado} className={filterStyles.radioLabel}>
            <input
              type="checkbox"
              className={filterStyles.radioInput}
              checked={estadoFiltro === estado}
              onChange={() => setEstadoFiltro(estado)}
            />
            {estado}
          </label>
        ))}
      </FilterSection>
    </>
  );

  if (view.mode === "entrada") {
    return (
      <EntradaForm
        entrada={view.entrada}
        vista={vista}
        onCambiarVista={onCambiarVista}
        onCancel={() => setView({ mode: "list" })}
        onSaved={() => {
          setView({ mode: "list" });
          loadCompras();
        }}
        onDeleted={() => {
          setView({ mode: "list" });
          loadCompras();
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por proveedor o N° de factura…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShoppingCart size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Compras y Entradas</h1>
          </div>
          <DataTable
            data={comprasFiltradas}
            columns={columns}
            onRowClick={abrirCompra}
            emptyMessage={loading ? "Cargando…" : "No hay compras que coincidan con el filtro."}
          />
        </div>
      </FilterLayout>

      {entradaDevolver && (
        <DevolverModal
          entrada={entradaDevolver}
          onClose={() => setEntradaDevolver(null)}
          onSuccess={() => {
            setEntradaDevolver(null);
            loadCompras();
          }}
        />
      )}
    </div>
  );
}
