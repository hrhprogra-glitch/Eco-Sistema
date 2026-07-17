"use client";

import { useEffect, useMemo, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { LoteDetalle } from "../types";

type AlmacenResumen = { almacen_id: string; almacen_nombre: string; cantidad_sistema: number };

export function AjusteStockForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState("");
  const [lotes, setLotes] = useState<LoteDetalle[]>([]);
  const [almacenId, setAlmacenId] = useState("");
  const [cantidadFisica, setCantidadFisica] = useState<number | "">("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ diferencia: number; sinCambios?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(data.filter((p) => p.rastrear_inventario)))
      .catch(() => setProductos([]));
  }, []);

  useEffect(() => {
    setAlmacenId("");
    setResultado(null);
    if (!productoId) {
      setLotes([]);
      return;
    }
    fetch(`/api/stock?producto_id=${productoId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setLotes)
      .catch(() => setLotes([]));
  }, [productoId]);

  // Un producto puede tener lotes en varios almacenes -- agrupamos para saber cuánto
  // dice el sistema que hay en el almacén elegido antes de comparar con el conteo físico.
  const resumenPorAlmacen = useMemo<AlmacenResumen[]>(() => {
    const mapa = new Map<string, AlmacenResumen>();
    for (const l of lotes) {
      const actual = mapa.get(l.almacen_id) ?? { almacen_id: l.almacen_id, almacen_nombre: l.almacen_nombre, cantidad_sistema: 0 };
      actual.cantidad_sistema += Number(l.cantidad_actual);
      mapa.set(l.almacen_id, actual);
    }
    return [...mapa.values()];
  }, [lotes]);

  const almacenSeleccionado = resumenPorAlmacen.find((a) => a.almacen_id === almacenId);
  const cantidadSistema = almacenSeleccionado?.cantidad_sistema ?? 0;
  const diferenciaPreview = cantidadFisica === "" ? null : Math.round((Number(cantidadFisica) - cantidadSistema) * 100) / 100;

  async function handleGuardar() {
    if (!productoId) {
      setError("Elegí un producto.");
      return;
    }
    if (!almacenId) {
      setError("Elegí en qué almacén contaste el stock.");
      return;
    }
    if (cantidadFisica === "" || cantidadFisica < 0) {
      setError("Ingresá la cantidad física contada.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/movimientos/ajustes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto_id: productoId, almacen_id: almacenId, cantidad_fisica: cantidadFisica, fecha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo registrar el ajuste.");
      }
      const data = await res.json();
      setResultado(data);
      if (!data.sinCambios) {
        setTimeout(onSaved, 900);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormLayout title="Marcar cantidad física" onSave={handleGuardar} onCancel={onCancel} isSaving={isSaving}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      {resultado && (
        <p className={fieldStyles.errorBanner} style={{ color: "var(--status-online)", borderColor: "var(--status-online)" }}>
          {resultado.sinCambios
            ? "El conteo ya coincide con el sistema, no hizo falta ajustar nada."
            : `Ajuste registrado: ${resultado.diferencia > 0 ? "+" : ""}${resultado.diferencia} unidades.`}
        </p>
      )}

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
          <span className={fieldStyles.label}>Almacén contado</span>
          <select className={fieldStyles.select} value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
            <option value="">{resumenPorAlmacen.length === 0 ? "Este producto no tiene stock en ningún almacén todavía" : "Elegir almacén…"}</option>
            {resumenPorAlmacen.map((a) => (
              <option key={a.almacen_id} value={a.almacen_id}>{a.almacen_nombre} — sistema: {a.cantidad_sistema}</option>
            ))}
          </select>
        </label>
      )}

      {almacenId && (
        <div className={fieldStyles.row}>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Cantidad en el sistema</span>
            <input className={fieldStyles.input} value={cantidadSistema} disabled />
          </label>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Cantidad física contada</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={fieldStyles.input}
              value={cantidadFisica}
              onChange={(e) => setCantidadFisica(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </label>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Diferencia</span>
            <input
              className={fieldStyles.input}
              value={diferenciaPreview === null ? "—" : `${diferenciaPreview > 0 ? "+" : ""}${diferenciaPreview}`}
              disabled
              style={{
                color: diferenciaPreview === null || diferenciaPreview === 0
                  ? undefined
                  : diferenciaPreview > 0
                    ? "var(--status-online)"
                    : "var(--status-error)",
                fontWeight: 700,
              }}
            />
          </label>
        </div>
      )}

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Fecha del conteo</span>
        <input
          type="date"
          className={fieldStyles.input}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </label>
    </FormLayout>
  );
}
