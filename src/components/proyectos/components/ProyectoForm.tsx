import { useState, useEffect } from "react";
import { Check, Minus, Package, Plus, Search, Trash2 } from "lucide-react";
import styles from "./ProyectoForm.module.css";

type CartItem = {
  key: string;
  producto_id: number | null;
  nombre: string;
  cantidad: number;
  justificacion: string | null;
  stock?: number;
};

export function ProyectoForm({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    nombre: string;
    empleados: number[];
    items: { producto_id: number | null; nombre_externo: string | null; cantidad: number; justificacion: string | null }[];
  }) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState<number[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [showExternalForm, setShowExternalForm] = useState(false);
  const [extNombre, setExtNombre] = useState("");
  const [extCantidad, setExtCantidad] = useState(1);
  const [extFactura, setExtFactura] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/empleados").then((res) => res.json()),
      fetch("/api/productos").then((res) => res.json()),
    ]).then(([empData, prodData]) => {
      setEmpleados(Array.isArray(empData) ? empData : []);
      setProductos(Array.isArray(prodData) ? prodData : []);
      setLoading(false);
    });
  }, []);

  const toggleEmpleado = (id: number) => {
    setSelectedEmpleados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const addProductoToCart = (producto: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto_id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key: `p-${producto.id}`,
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          justificacion: null,
          stock: producto.stock,
        },
      ];
    });
  };

  const addExternalToCart = () => {
    if (!extNombre || extCantidad <= 0 || !extFactura) {
      alert("Completa nombre, cantidad y N° de factura del producto externo.");
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        key: `ext-${Date.now()}`,
        producto_id: null,
        nombre: extNombre,
        cantidad: extCantidad,
        justificacion: extFactura,
      },
    ]);
    setExtNombre("");
    setExtCantidad(1);
    setExtFactura("");
    setShowExternalForm(false);
  };

  const updateCartQty = (key: string, cantidad: number) => {
    if (cantidad <= 0) return;
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, cantidad } : item)));
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      nombre,
      empleados: selectedEmpleados,
      items: cart.map((item) => ({
        producto_id: item.producto_id,
        nombre_externo: item.producto_id ? null : item.nombre,
        cantidad: item.cantidad,
        justificacion: item.justificacion,
      })),
    });
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <div className={styles.topBar}>
        <button type="button" onClick={onCancel} className={styles.back}>
          Proyectos
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>Nuevo Proyecto</span>

        <div className={styles.topBarActions}>
          <button type="button" onClick={onCancel} className={styles.discardButton} disabled={isSaving}>
            Descartar
          </button>
          <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className={styles.headerRow}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          placeholder="Nombre del Proyecto"
          className={styles.nameInput}
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.column}>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Asignar Trabajadores</span>
            {loading ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Cargando empleados...</div>
            ) : (
              <div className={styles.employeeGrid}>
                {empleados.map((emp) => {
                  const isSelected = selectedEmpleados.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmpleado(emp.id)}
                      className={`${styles.employeeItem} ${isSelected ? styles.employeeItemSelected : ""}`}
                    >
                      <div
                        className={styles.employeeAvatar}
                        style={{ backgroundImage: emp.foto_url ? `url(${emp.foto_url})` : "none" }}
                      >
                        {!emp.foto_url && emp.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {emp.nombre}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{emp.puesto}</div>
                      </div>
                      {isSelected && <Check size={16} color="var(--eco-azul)" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Materiales Agregados ({cart.length})</span>
            {cart.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  border: "1px dashed var(--border-color)",
                }}
              >
                Busca a la derecha y haz clic en un material para agregarlo.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                {cart.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.nombre}
                      </div>
                      <div style={{ fontSize: "11px", color: item.producto_id ? "var(--eco-azul)" : "#f59e0b" }}>
                        {item.producto_id ? "Del inventario" : `Externo · ${item.justificacion}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, item.cantidad - 1)}
                        style={{ background: "var(--bg-page)", border: "1px solid var(--border-color)", cursor: "pointer", padding: "4px" }}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) => updateCartQty(item.key, Number(e.target.value))}
                        style={{
                          width: "48px",
                          textAlign: "center",
                          padding: "4px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-page)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, item.cantidad + 1)}
                        style={{ background: "var(--bg-page)", border: "1px solid var(--border-color)", cursor: "pointer", padding: "4px" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      title="Quitar"
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Agregar Materiales</span>

            <div style={{ position: "relative", marginTop: "8px" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "9px", color: "var(--text-secondary)" }} />
              <input
                type="text"
                placeholder="Buscar en inventario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 32px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowExternalForm(!showExternalForm)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                background: showExternalForm ? "var(--bg-surface)" : "rgba(2, 132, 199, 0.1)",
                color: "var(--eco-azul)",
                border: "1px dashed var(--eco-azul)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Plus size={16} /> {showExternalForm ? "Cancelar ingreso externo" : "Ingresar producto externo"}
            </button>

            {showExternalForm ? (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: "var(--bg-surface)",
                  padding: "16px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={extNombre}
                  onChange={(e) => setExtNombre(e.target.value)}
                  style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Cantidad"
                  value={extCantidad}
                  onChange={(e) => setExtCantidad(Number(e.target.value))}
                  style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
                />
                <input
                  type="text"
                  placeholder="N° Factura / Justificación"
                  value={extFactura}
                  onChange={(e) => setExtFactura(e.target.value)}
                  style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
                />
                <button
                  type="button"
                  onClick={addExternalToCart}
                  style={{ padding: "8px", background: "var(--accent-strong)", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}
                >
                  Agregar al carrito
                </button>
              </div>
            ) : loading ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "16px" }}>Cargando materiales...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", marginTop: "16px" }}>
                {filteredProductos.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addProductoToCart(p)}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-color)",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "72px",
                        background: "var(--bg-page)",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundImage: p.foto_url ? `url(${p.foto_url})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {!p.foto_url && <Package size={24} opacity={0.5} />}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.nombre}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Stock: <strong style={{ color: p.stock > 0 ? "var(--eco-azul)" : "#ef4444" }}>{p.stock}</strong>
                    </div>
                  </div>
                ))}
                {filteredProductos.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--text-secondary)", fontSize: "13px" }}>
                    No se encontraron materiales.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
