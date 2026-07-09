import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, Users } from "lucide-react";
import { MaterialPicker, type PickerProducto } from "./MaterialPicker";
import { QtyInput } from "./QtyInput";
import styles from "./ProyectoForm.module.css";

type CartItem = {
  key: string;
  producto_id: number | null;
  nombre: string;
  cantidad: number;
  precio: number;
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
  const [workersOpen, setWorkersOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch("/api/empleados")
      .then((res) => res.json())
      .then((data) => setEmpleados(Array.isArray(data) ? data : []));
  }, []);

  const toggleEmpleado = (id: number) => {
    setSelectedEmpleados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const addProductoToCart = (producto: PickerProducto) => {
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
          precio: producto.precio,
          justificacion: null,
          stock: producto.stock,
        },
      ];
    });
  };

  const addExternalToCart = (nombreExt: string, cantidad: number, justificacion: string) => {
    setCart((prev) => [
      ...prev,
      {
        key: `ext-${Date.now()}`,
        producto_id: null,
        nombre: nombreExt,
        cantidad,
        precio: 0,
        justificacion,
      },
    ]);
  };

  const updateCartQty = (key: string, cantidad: number) => {
    if (cantidad <= 0) return;
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, cantidad } : item)));
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const totalMateriales = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const totalValor = cart.reduce((sum, item) => sum + item.cantidad * item.precio, 0);

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

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <div className={styles.topBar}>
        <button type="button" onClick={onCancel} className={styles.back}>
          Proyectos
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>Nuevo Proyecto</span>
      </div>

      <div className={styles.nameRow}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          placeholder="Nombre del Proyecto"
          className={styles.nameInput}
        />
      </div>

      <div className={styles.workersSection}>
        <div className={styles.workersHeader} onClick={() => setWorkersOpen((o) => !o)}>
          <div className={styles.workersHeaderLeft}>
            <Users size={15} />
            <span className={styles.workersLabel}>Trabajadores</span>
            {selectedEmpleados.length > 0 && (
              <span className={styles.workersBadge}>{selectedEmpleados.length}</span>
            )}
          </div>
          {workersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {workersOpen && (
          <div className={styles.workersPanel}>
            {empleados.map((emp) => {
              const isSelected = selectedEmpleados.includes(emp.id);
              return (
                <div
                  key={emp.id}
                  onClick={() => toggleEmpleado(emp.id)}
                  className={`${styles.workerChip} ${isSelected ? styles.workerChipSelected : ""}`}
                  title={emp.puesto}
                >
                  <div
                    className={styles.workerAvatar}
                    style={{ backgroundImage: emp.foto_url ? `url(${emp.foto_url})` : "none" }}
                  >
                    {!emp.foto_url && emp.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.workerChipName}>{emp.nombre}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.posRow}>
        <div className={styles.posMain}>
          <MaterialPicker onAddProducto={addProductoToCart} onAddExterno={addExternalToCart} />
        </div>

        <div className={styles.ticket}>
          <div className={styles.ticketColumns}>
            <span style={{ flex: 1 }}>Material</span>
            <span style={{ width: "56px", textAlign: "center" }}>Cant.</span>
            <span style={{ width: "70px", textAlign: "right" }}>Subtotal</span>
            <span style={{ width: "24px" }} />
          </div>
          <div className={styles.ticketBody}>
            {cart.length === 0 ? (
              <div className={styles.ticketEmpty}>
                Busca a la izquierda y presiona Enter (o haz clic) para agregar un material.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.key} className={styles.ticketItem}>
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
                  <QtyInput
                    value={item.cantidad}
                    onChange={(n) => updateCartQty(item.key, n)}
                    style={{
                      width: "56px",
                      textAlign: "center",
                      padding: "6px 4px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  <div style={{ width: "70px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.precio > 0 ? `S/ ${(item.cantidad * item.precio).toFixed(2)}` : "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    title="Quitar"
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", flexShrink: 0 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={styles.ticketFooter}>
            <div className={styles.ticketTotalsRow}>
              <span>Materiales</span>
              <strong>{totalMateriales}</strong>
            </div>
            <div className={styles.ticketTotalsRow}>
              <span>Valor estimado</span>
              <strong>S/ {totalValor.toFixed(2)}</strong>
            </div>
            <div className={styles.ticketActions}>
              <button type="button" onClick={onCancel} className={styles.discardButton} disabled={isSaving}>
                Descartar
              </button>
              <button type="submit" className={styles.saveButton} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Proyecto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
