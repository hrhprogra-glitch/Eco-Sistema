"use client";

import { useEffect, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import { ProductoSelector } from "@/components/ui/ProductoSelector";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { LoteDetalle } from "../types";

// Alta y edición de un lote, en un solo formulario -- si viene `lote`, edita ese; si no,
// crea uno nuevo. Si además viene `productoId` (se abrió desde el detalle de un producto
// puntual), el producto ya queda fijo; si no (se abrió desde "Nuevo lote" en el panel de
// acciones), primero hay que elegir para cuál es. Al crear solo hace falta una "Cantidad"
// (arranca igual a la disponible); al editar se separan cantidad inicial y actual porque
// ya pudo haberse consumido parte del lote.
export function LoteForm({
  productoId,
  almacenId,
  lote,
  onCancel,
  onSaved,
}: {
  productoId?: string;
  almacenId: string;
  lote?: LoteDetalle;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const esEdicion = Boolean(lote);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoElegido, setProductoElegido] = useState(productoId ?? "");
  const [numeroLote, setNumeroLote] = useState(lote?.numero_lote ?? "");
  const [cantidadInicial, setCantidadInicial] = useState<number | "">(lote ? Number(lote.cantidad_inicial) : "");
  const [cantidadActual, setCantidadActual] = useState<number | "">(lote ? Number(lote.cantidad_actual) : "");
  const [costoUnitario, setCostoUnitario] = useState<number | "">(lote ? Number(lote.costo_unitario) : 0);
  const [fechaVencimiento, setFechaVencimiento] = useState(lote?.fecha_vencimiento?.slice(0, 10) ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sin producto preseleccionado (se abrió desde "Nuevo lote" en el panel de acciones, no
  // desde el detalle de un producto puntual): hace falta el catálogo para poder elegirlo.
  useEffect(() => {
    if (productoId) return;
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(data.filter((p) => p.rastrear_inventario)))
      .catch(() => setProductos([]));
  }, [productoId]);

  async function handleGuardar() {
    if (!productoId && !productoElegido) {
      setError("Elegí un producto.");
      return;
    }
    if (!esEdicion && (cantidadInicial === "" || Number(cantidadInicial) <= 0)) {
      setError("Ingresá una cantidad mayor a 0.");
      return;
    }
    if (esEdicion && (cantidadActual === "" || Number(cantidadActual) < 0)) {
      setError("Ingresá la cantidad actual.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = esEdicion
        ? await fetch(`/api/lotes/${lote!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              numero_lote: numeroLote.trim() || null,
              cantidad_inicial: Number(cantidadInicial),
              cantidad_actual: Number(cantidadActual),
              costo_unitario: Number(costoUnitario) || 0,
              fecha_vencimiento: fechaVencimiento || null,
            }),
          })
        : await fetch("/api/lotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              producto_id: productoId || productoElegido,
              almacen_id: almacenId,
              numero_lote: numeroLote.trim() || null,
              cantidad: Number(cantidadInicial),
              costo_unitario: Number(costoUnitario) || 0,
              fecha_vencimiento: fechaVencimiento || null,
            }),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar el lote.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEliminar() {
    if (!lote) return;
    if (!window.confirm("¿Eliminar este lote? Esta acción no se puede deshacer.")) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/lotes/${lote.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el lote.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  return (
    <FormLayout
      title={esEdicion ? "Editar lote" : "Agregar lote"}
      onSave={handleGuardar}
      onCancel={onCancel}
      onDelete={esEdicion ? handleEliminar : undefined}
      isSaving={isSaving}
      width={480}
    >
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      {!productoId && (
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Producto</span>
          <ProductoSelector value={productoElegido} productos={productos} onSelect={setProductoElegido} />
        </label>
      )}

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Número de lote (opcional)</span>
        <input className={fieldStyles.input} value={numeroLote} onChange={(e) => setNumeroLote(e.target.value)} />
      </label>

      {esEdicion ? (
        <div className={fieldStyles.row}>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Cantidad inicial</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={fieldStyles.input}
              value={cantidadInicial}
              onChange={(e) => setCantidadInicial(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </label>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Cantidad actual</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={fieldStyles.input}
              value={cantidadActual}
              onChange={(e) => setCantidadActual(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </label>
        </div>
      ) : (
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Cantidad</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={cantidadInicial}
            onChange={(e) => setCantidadInicial(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
      )}

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Costo unitario</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={costoUnitario}
            onChange={(e) => setCostoUnitario(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Fecha de vencimiento (opcional)</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
          />
        </label>
      </div>
    </FormLayout>
  );
}
