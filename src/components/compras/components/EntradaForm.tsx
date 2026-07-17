"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2, Trash2, Plus, XCircle } from "lucide-react";
import { ActionsDrawer } from "@/components/ui/ActionsDrawer";
import type { ModuleAction } from "@/components/ui/ModuleActions";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { Proveedor } from "@/components/proveedores/types";
import type { Entrada, Almacen } from "@/components/movimientos/types";
import styles from "./EntradaForm.module.css";

type LineaEditable = {
  producto_id: string;
  almacen_id: string;
  cantidad: number;
  costo_unitario: number;
  fecha_vencimiento: string;
};

function lineaVacia(almacenId: string): LineaEditable {
  return { producto_id: "", almacen_id: almacenId, cantidad: 1, costo_unitario: 0, fecha_vencimiento: "" };
}

export function EntradaForm({
  entrada,
  onCancel,
  onSaved,
  onDeleted,
}: {
  entrada?: Entrada;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  const [proveedorId, setProveedorId] = useState(entrada?.proveedor_id ?? "");
  const [numeroFactura, setNumeroFactura] = useState(entrada?.numero_factura_proveedor ?? "");
  const [fecha, setFecha] = useState(entrada?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [moneda, setMoneda] = useState<"PEN" | "USD">(entrada?.moneda ?? "PEN");
  const [notas, setNotas] = useState(entrada?.notas ?? "");
  const [lineas, setLineas] = useState<LineaEditable[]>(
    entrada?.lineas?.map((l) => ({
      producto_id: l.producto_id,
      almacen_id: l.almacen_id,
      cantidad: Number(l.cantidad),
      costo_unitario: Number(l.costo_unitario),
      fecha_vencimiento: l.fecha_vencimiento?.slice(0, 10) ?? "",
    })) ?? []
  );

  const [entradaId, setEntradaId] = useState(entrada?.id);
  const [estado, setEstado] = useState(entrada?.estado ?? "borrador");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos").then((r) => (r.ok ? r.json() : [])).then(setProductos).catch(() => setProductos([]));
    fetch("/api/proveedores").then((r) => (r.ok ? r.json() : [])).then(setProveedores).catch(() => setProveedores([]));
    fetch("/api/almacenes").then((r) => (r.ok ? r.json() : [])).then((data: Almacen[]) => {
      setAlmacenes(data);
      if (!entrada && data.length > 0) {
        setLineas((prev) => (prev.length > 0 ? prev : [lineaVacia(data[0].id)]));
      }
    }).catch(() => setAlmacenes([]));
  }, [entrada]);

  function actualizarLinea(index: number, patch: Partial<LineaEditable>) {
    setLineas((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function agregarLinea() {
    setLineas((prev) => [...prev, lineaVacia(almacenes[0]?.id ?? "")]);
  }

  function quitarLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lineas.reduce((sum, l) => sum + l.cantidad * l.costo_unitario, 0);
  const puedeEditar = estado === "borrador";
  const simboloMoneda = moneda === "USD" ? "US$" : "S/";

  function validar(): string | null {
    if (!proveedorId) return "Elegí un proveedor.";
    if (lineas.length === 0) return "Agregá al menos una línea.";
    for (const l of lineas) {
      if (!l.producto_id) return "Todas las líneas necesitan un producto.";
      if (!l.almacen_id) return "Todas las líneas necesitan un almacén.";
      if (l.cantidad <= 0) return "La cantidad tiene que ser mayor a 0.";
    }
    return null;
  }

  async function guardar(): Promise<string | null> {
    const validacion = validar();
    if (validacion) {
      setError(validacion);
      return null;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        proveedor_id: proveedorId,
        numero_factura_proveedor: numeroFactura || null,
        fecha,
        moneda,
        notas: notas || null,
        lineas: lineas.map((l) => ({
          producto_id: l.producto_id,
          almacen_id: l.almacen_id,
          cantidad: l.cantidad,
          costo_unitario: l.costo_unitario,
          subtotal: l.cantidad * l.costo_unitario,
          fecha_vencimiento: l.fecha_vencimiento || null,
        })),
      };

      const res = await fetch(entradaId ? `/api/entradas/${entradaId}` : "/api/entradas", {
        method: entradaId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la compra.");
      const data = await res.json();
      const id = entradaId ?? data.id;
      setEntradaId(id);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGuardar() {
    if (await guardar()) onSaved();
  }

  async function handleConfirmar() {
    const id = await guardar();
    if (!id) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/entradas/${id}/confirmar`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo confirmar la compra.");
      }
      setEstado("confirmada");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEliminar() {
    if (!entradaId) return onCancel();
    if (!window.confirm("¿Eliminar esta compra? Esta acción no se puede deshacer.")) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/entradas/${entradaId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la compra.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  const actions: ModuleAction[] = [
    { key: "guardar", icon: Save, label: "Guardar borrador", onClick: handleGuardar, disabled: isSaving || !puedeEditar, tone: "primary" },
    ...(puedeEditar
      ? [{ key: "confirmar", icon: CheckCircle2, label: "Confirmar compra", onClick: handleConfirmar, disabled: isSaving }]
      : []),
    ...(entradaId
      ? [{ key: "eliminar", icon: Trash2, label: "Eliminar", onClick: handleEliminar, disabled: isSaving, tone: "danger" as const }]
      : []),
    { key: "cerrar", icon: XCircle, label: "Cerrar", onClick: onCancel },
  ];

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <ActionsDrawer actions={actions} />

      <div className={styles.page}>
        <div className={styles.layout}>
          {error && <p className={fieldStyles.errorBanner}>{error}</p>}

          {entradaId && (
            <div>
              <span className={styles.estadoBadge} data-estado={estado}>
                {estado === "borrador" ? "Borrador" : estado === "confirmada" ? "Confirmada" : "Cancelada"}
              </span>
            </div>
          )}

          <div className={fieldStyles.row}>
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Proveedor (razón social)</span>
              <select
                className={fieldStyles.select}
                value={proveedorId}
                disabled={!puedeEditar}
                onChange={(e) => setProveedorId(e.target.value)}
              >
                <option value="">Elegir proveedor…</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}{p.ruc ? ` — RUC ${p.ruc}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>N° de factura del proveedor</span>
              <input
                className={fieldStyles.input}
                value={numeroFactura}
                disabled={!puedeEditar}
                onChange={(e) => setNumeroFactura(e.target.value)}
              />
            </label>
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Fecha de compra</span>
              <input
                type="date"
                className={fieldStyles.input}
                value={fecha}
                disabled={!puedeEditar}
                onChange={(e) => setFecha(e.target.value)}
              />
            </label>
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Moneda</span>
              <select
                className={fieldStyles.select}
                value={moneda}
                disabled={!puedeEditar}
                onChange={(e) => setMoneda(e.target.value as "PEN" | "USD")}
              >
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares (US$)</option>
              </select>
            </label>
          </div>

          <div>
            <table className={styles.lineasTable}>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Producto</th>
                  <th style={{ width: "16%" }}>Almacén</th>
                  <th>Cantidad</th>
                  <th>Costo unitario (sin IGV)</th>
                  <th>Vencimiento</th>
                  <th>Subtotal</th>
                  {puedeEditar && <th />}
                </tr>
              </thead>
              <tbody>
                {lineas.map((linea, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={linea.producto_id}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarLinea(index, { producto_id: e.target.value })}
                      >
                        <option value="">Elegir producto…</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={linea.almacen_id}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarLinea(index, { almacen_id: e.target.value })}
                      >
                        {almacenes.map((a) => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={linea.cantidad}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarLinea(index, { cantidad: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={linea.costo_unitario}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarLinea(index, { costo_unitario: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={linea.fecha_vencimiento}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarLinea(index, { fecha_vencimiento: e.target.value })}
                      />
                    </td>
                    <td className={styles.subtotalCell}>{simboloMoneda} {(linea.cantidad * linea.costo_unitario).toFixed(2)}</td>
                    {puedeEditar && (
                      <td>
                        <button type="button" className={styles.removeBtn} onClick={() => quitarLinea(index)} aria-label="Quitar línea">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {puedeEditar && (
              <button type="button" className={styles.addLineaBtn} onClick={agregarLinea}>
                <Plus size={14} />
                Agregar línea
              </button>
            )}

            <div className={styles.totalRow}>
              <span>Total (sin IGV)</span>
              <span>{simboloMoneda} {total.toFixed(2)}</span>
            </div>
          </div>

          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Notas</span>
            <textarea
              className={fieldStyles.textarea}
              rows={2}
              value={notas}
              disabled={!puedeEditar}
              onChange={(e) => setNotas(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
