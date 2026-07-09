import { useState, useEffect } from "react";
import { ArrowLeft, Check, Package, Pencil, Trash2, X } from "lucide-react";
import type { Proyecto, ProyectoItem } from "../types";
import { MaterialPicker, type PickerProducto } from "./MaterialPicker";
import { QtyInput } from "./QtyInput";

export function ProyectoDetail({
  proyectoId,
  onBack,
  onDeleteProject,
}: {
  proyectoId: number;
  onBack: () => void;
  onDeleteProject: (id: number) => void;
}) {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingCantidad, setEditingCantidad] = useState(1);

  const loadData = async () => {
    setLoading(true);
    const projRes = await fetch(`/api/proyectos/${proyectoId}`);
    if (projRes.ok) setProyecto(await projRes.json());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [proyectoId]);

  const handleAddItem = async (productoId: number | null, nombreExterno: string | null, cantidad: number, justificacion: string | null) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/consumos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        producto_id: productoId,
        nombre_externo: nombreExterno,
        cantidad,
        justificacion
      })
    });

    if (res.ok) {
      loadData(); // Reload to get updated items and inventory
    }
  };

  const startEditItem = (item: ProyectoItem) => {
    setEditingItemId(item.id);
    setEditingCantidad(item.cantidad);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
  };

  const saveEditItem = async (itemId: number) => {
    if (editingCantidad <= 0) return;
    const res = await fetch(`/api/proyectos/${proyectoId}/consumos/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: editingCantidad }),
    });
    if (res.ok) {
      setEditingItemId(null);
      loadData();
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm("¿Quitar este material del proyecto? El stock se devolverá al inventario.")) return;
    const res = await fetch(`/api/proyectos/${proyectoId}/consumos/${itemId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      loadData();
    }
  };

  if (loading || !proyecto) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Cargando proyecto...</div>;
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* Lado izquierdo: Detalles e Historial (llena el espacio restante) */}
      <div style={{ flex: 1, minWidth: 0, padding: "24px", overflowY: "auto", borderRight: "1px solid var(--border-color)", background: "var(--bg-page)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "24px", color: "var(--text-primary)" }}>{proyecto.nombre}</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              {proyecto.empleados?.map(e => e.nombre).join(", ")}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("¿Eliminar proyecto definitivamente?")) onDeleteProject(proyecto.id);
            }}
            style={{
              background: "transparent", color: "#ef4444", border: "1px solid #ef4444",
              padding: "8px 16px", borderRadius: "0", cursor: "pointer", fontWeight: "600"
            }}
          >
            Eliminar Proyecto
          </button>
        </div>

        <h3 style={{ fontSize: "18px", color: "var(--text-primary)", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
          Materiales Utilizados
        </h3>

        {proyecto.items && proyecto.items.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {proyecto.items.map(item => (
              <div key={item.id} style={{
                background: "var(--bg-surface)", padding: "16px", borderRadius: "0",
                border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "16px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "0", background: "var(--eco-celeste)",
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundImage: item.producto_foto ? `url(${item.producto_foto})` : 'none',
                  backgroundSize: "cover", backgroundPosition: "center"
                }}>
                  {!item.producto_foto && <Package size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "16px" }}>
                    {item.producto_nombre || item.nombre_externo}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                    {editingItemId === item.id ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        Cantidad:
                        <QtyInput
                          value={editingCantidad}
                          onChange={setEditingCantidad}
                          autoFocus
                          style={{ width: "56px", padding: "4px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
                        />
                      </span>
                    ) : (
                      <span>Cantidad: <strong style={{ color: "var(--text-primary)" }}>{item.cantidad}</strong></span>
                    )}
                    {item.justificacion && <span>Factura: {item.justificacion}</span>}
                    <span style={{ color: item.producto_id ? "var(--eco-azul)" : "#f59e0b", fontWeight: "500" }}>
                      {item.producto_id ? "Del Inventario" : "Externo"}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {editingItemId === item.id ? (
                    <>
                      <button
                        onClick={() => saveEditItem(item.id)}
                        title="Guardar"
                        style={{ background: "none", border: "none", color: "var(--eco-azul)", cursor: "pointer", padding: "4px" }}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={cancelEditItem}
                        title="Cancelar"
                        style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditItem(item)}
                        title="Editar cantidad"
                        style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        title="Quitar material"
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", background: "var(--bg-surface)", borderRadius: "0", border: "1px dashed var(--border-color)" }}>
            Aún no se han registrado materiales en este proyecto.
          </div>
        )}
      </div>

      {/* Lado derecho: agregar material (panel fijo, estilo ticket de Odoo) */}
      <div style={{ width: "360px", flexShrink: 0, background: "var(--bg-surface)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", flex: 1, overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "var(--text-primary)" }}>Agregar Material</h3>
          <MaterialPicker
            onAddProducto={(p: PickerProducto) => handleAddItem(p.id, null, 1, null)}
            onAddExterno={(nombre, cantidad, justificacion) => handleAddItem(null, nombre, cantidad, justificacion)}
          />
        </div>
      </div>
    </div>
  );
}
