import { useState, useEffect } from "react";
import { ArrowLeft, Check, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { Proyecto, ProyectoItem } from "../types";

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
  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingCantidad, setEditingCantidad] = useState(1);

  // External item state
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [extNombre, setExtNombre] = useState("");
  const [extCantidad, setExtCantidad] = useState(1);
  const [extFactura, setExtFactura] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [projRes, prodRes] = await Promise.all([
      fetch(`/api/proyectos/${proyectoId}`),
      fetch("/api/productos")
    ]);
    
    if (projRes.ok) setProyecto(await projRes.json());
    if (prodRes.ok) setProductos(await prodRes.json());
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
      setShowExternalForm(false);
      setExtNombre("");
      setExtCantidad(1);
      setExtFactura("");
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

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* Lado izquierdo: Detalles e Historial (60%) */}
      <div style={{ flex: "6", padding: "24px", overflowY: "auto", borderRight: "1px solid var(--border-color)", background: "var(--bg-page)" }}>
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
                        <input
                          type="number"
                          min={1}
                          autoFocus
                          value={editingCantidad}
                          onChange={e => setEditingCantidad(Number(e.target.value))}
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

      {/* Lado derecho: Punto de Venta / Inventario (40%) */}
      <div style={{ flex: "4", background: "var(--bg-surface)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "var(--text-primary)" }}>Agregar Material</h3>
          
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "12px", top: "10px", color: "var(--text-secondary)" }} />
              <input 
                type="text" 
                placeholder="Buscar en inventario..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  width: "100%", padding: "10px 10px 10px 36px", borderRadius: "0", 
                  border: "1px solid var(--border-color)", background: "var(--bg-page)",
                  color: "var(--text-primary)"
                }}
              />
            </div>
          </div>
          
          <button 
            onClick={() => setShowExternalForm(!showExternalForm)}
            style={{ 
              width: "100%", padding: "10px", background: showExternalForm ? "var(--bg-page)" : "rgba(2, 132, 199, 0.1)", 
              color: "var(--eco-azul)", border: "1px dashed var(--eco-azul)", borderRadius: "0", 
              cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <Plus size={18} /> {showExternalForm ? "Cancelar Ingreso Externo" : "Ingresar Producto Externo (Sin Inventario)"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {showExternalForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-page)", padding: "20px", borderRadius: "0", border: "1px solid var(--border-color)" }}>
              <h4 style={{ margin: 0, color: "var(--text-primary)" }}>Producto Externo</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Nombre del producto</label>
                <input type="text" value={extNombre} onChange={e => setExtNombre(e.target.value)} style={{ padding: "8px", borderRadius: "0", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Cantidad</label>
                <input type="number" min="1" value={extCantidad} onChange={e => setExtCantidad(Number(e.target.value))} style={{ padding: "8px", borderRadius: "0", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>N° Factura / Justificación</label>
                <input type="text" value={extFactura} onChange={e => setExtFactura(e.target.value)} placeholder="Ej. Factura F001-234" style={{ padding: "8px", borderRadius: "0", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }} />
              </div>

              <button 
                onClick={() => {
                  if (extNombre && extCantidad > 0 && extFactura) {
                    handleAddItem(null, extNombre, extCantidad, extFactura);
                  } else {
                    alert("Por favor completa todos los campos.");
                  }
                }}
                style={{ padding: "10px", background: "var(--accent-strong)", color: "white", border: "none", borderRadius: "0", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}
              >
                Guardar Externo
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {filteredProductos.map(p => (
                <div key={p.id} style={{ 
                  background: "var(--bg-page)", border: "1px solid var(--border-color)", 
                  borderRadius: "0", padding: "12px", display: "flex", flexDirection: "column",
                  cursor: "pointer", transition: "transform 0.1s, border-color 0.1s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--eco-azul)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
                onClick={() => {
                  const qty = prompt(`¿Cuántos "${p.nombre}" vas a usar en este proyecto? (Stock actual: ${p.stock})`, "1");
                  if (qty && !isNaN(Number(qty)) && Number(qty) > 0) {
                    handleAddItem(p.id, null, Number(qty), null);
                  }
                }}
                >
                  <div style={{
                    width: "100%", height: "100px", borderRadius: "0", background: "var(--bg-surface)",
                    marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundImage: p.foto_url ? `url(${p.foto_url})` : 'none',
                    backgroundSize: "cover", backgroundPosition: "center", color: "var(--text-secondary)"
                  }}>
                    {!p.foto_url && <Package size={32} opacity={0.5} />}
                  </div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span>{p.sku || p.categoria || "Sin SKU"}</span>
                    <strong style={{ color: p.stock > 0 ? "var(--eco-azul)" : "#ef4444" }}>Stock: {p.stock}</strong>
                  </div>
                </div>
              ))}
              
              {filteredProductos.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  No se encontraron productos en el inventario.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



