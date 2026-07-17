"use client";

import { useEffect, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { LoteDetalle } from "@/components/stock/types";

export function SalidaForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState("");
  const [lotes, setLotes] = useState<LoteDetalle[]>([]);
  const [loteId, setLoteId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(data.filter((p) => p.rastrear_inventario)))
      .catch(() => setProductos([]));
  }, []);

  useEffect(() => {
    setLoteId("");
    if (!productoId) {
      setLotes([]);
      return;
    }
    fetch(`/api/movimientos/salidas?producto_id=${productoId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setLotes)
      .catch(() => setLotes([]));
  }, [productoId]);

  const loteSeleccionado = lotes.find((l) => l.id === loteId);

  async function handleGuardar() {
    if (!loteId) {
      setError("Elegí de qué lote sale la mercadería.");
      return;
    }
    if (cantidad <= 0) {
      setError("La cantidad tiene que ser mayor a 0.");
      return;
    }
    if (loteSeleccionado && cantidad > Number(loteSeleccionado.cantidad_actual)) {
      setError(`Ese lote solo tiene ${loteSeleccionado.cantidad_actual} disponibles.`);
      return;
    }
    if (!motivo.trim()) {
      setError("Indicá el motivo de la salida.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/movimientos/salidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lote_id: loteId, cantidad, motivo: motivo.trim(), fecha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo registrar la salida.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormLayout title="Nueva salida" onSave={handleGuardar} onCancel={onCancel} isSaving={isSaving}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Producto</span>
        <select className={fieldStyles.select} value={productoId} onChange={(e) => setProductoId(e.target.value)}>
          <option value="">Elegir producto…</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
          ))}
        </select>
      </label>

      {productoId && (
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Lote</span>
          <select className={fieldStyles.select} value={loteId} onChange={(e) => setLoteId(e.target.value)}>
            <option value="">{lotes.length === 0 ? "Este producto no tiene stock disponible" : "Elegir lote…"}</option>
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.numero_lote || `Lote ${l.id.slice(0, 8)}`} — {l.almacen_nombre} — disponible: {l.cantidad_actual}
                {l.fecha_vencimiento ? ` — vence ${l.fecha_vencimiento.slice(0, 10)}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Cantidad</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Fecha</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
      </div>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Motivo</span>
        <input
          className={fieldStyles.input}
          placeholder="Ej: venta, consumo interno, merma…"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </label>
    </FormLayout>
  );
}
