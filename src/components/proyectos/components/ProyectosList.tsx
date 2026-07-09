import { useState } from "react";
import { Plus, MoreVertical, Clock, Trash2 } from "lucide-react";
import type { Proyecto } from "../types";

export function ProyectosList({
  proyectos,
  onCreate,
  onSelect,
  onDelete,
}: {
  proyectos: Proyecto[];
  onCreate: () => void;
  onSelect: (p: Proyecto) => void;
  onDelete: (id: number) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-body)" }}>
      {/* Odoo Control Panel */}
      <div style={{
        padding: "12px 16px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)",
        display: "flex", alignItems: "center", gap: "16px"
      }}>
        <button
          onClick={onCreate}
          style={{
            background: "var(--accent-strong)", color: "white", border: "none",
            padding: "8px 16px", borderRadius: "0", fontSize: "14px", fontWeight: "500",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          Nuevo
        </button>
        <div style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: "400" }}>
          Proyectos
        </div>
      </div>

      {/* Grid of Odoo Project Cards */}
      <div style={{
        flex: 1, padding: "16px", overflowY: "auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px",
        alignItems: "start", alignContent: "start"
      }}>
        {proyectos.map(p => {
          const isFinished = p.estado === 'finalizado';
          const leftColor = isFinished ? "#10b981" : "var(--eco-azul)";
          const isMenuOpen = openMenuId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                background: "var(--bg-surface)",
                borderRadius: "0", // very square
                cursor: "pointer",
                border: "1px solid var(--border-color)",
                borderLeft: `3px solid ${leftColor}`, // signature left color strip
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.2s",
                height: "160px", // Fixed height for Odoo card feel
                position: "relative",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)"}
            >
              {/* Card Body */}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {p.nombre}
                  </h4>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : p.id);
                    }}
                    style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                        style={{ position: "fixed", inset: 0, zIndex: 20 }}
                      />
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: "absolute", top: "40px", right: "12px", zIndex: 21,
                          background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: "160px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            if (confirm(`¿Eliminar el proyecto "${p.nombre}" definitivamente?`)) {
                              onDelete(p.id);
                            }
                          }}
                          style={{
                            width: "100%", padding: "10px 14px", background: "none", border: "none",
                            color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "500",
                            display: "flex", alignItems: "center", gap: "8px", textAlign: "left",
                          }}
                        >
                          <Trash2 size={14} /> Eliminar proyecto
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span><strong style={{ color: "var(--text-primary)" }}>{p.items?.length || 0}</strong> Consumos</span>
                  <span><strong style={{ color: "var(--text-primary)" }}>{p.empleados?.length || 0}</strong> Trabajadores</span>
                </div>
              </div>

              {/* Card Footer (grey area in Odoo) */}
              <div style={{
                background: "rgba(0,0,0,0.02)", borderTop: "1px solid var(--border-color)",
                padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ display: "flex", gap: "12px", color: "var(--text-secondary)" }}>
                  <Clock size={16} />
                </div>

                {/* Employee Avatars (overlapping) */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {p.empleados?.slice(0, 3).map((emp, i) => (
                    <div key={i} title={emp.nombre} style={{
                      width: "26px", height: "26px", borderRadius: "0", background: "var(--eco-azul)",
                      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold", border: "2px solid var(--bg-surface)",
                      marginLeft: i > 0 ? "-8px" : "0",
                      backgroundImage: emp.foto_url ? `url(${emp.foto_url})` : 'none',
                      backgroundSize: "cover", backgroundPosition: "center",
                      zIndex: 10 - i
                    }}>
                      {!emp.foto_url && emp.nombre.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {(p.empleados?.length || 0) > 3 && (
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "0", background: "var(--bg-page)",
                      color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold", border: "2px solid var(--bg-surface)",
                      marginLeft: "-8px", zIndex: 0
                    }}>
                      +{p.empleados!.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
