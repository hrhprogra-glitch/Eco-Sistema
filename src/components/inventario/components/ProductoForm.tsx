"use client";

import { useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "../types";

type ProductoFormData = Pick<
  Producto,
  "nombre" | "sku" | "categoria" | "unidad" | "tipo" | "rastrear_inventario" | "precio" | "costo" | "limite_stock" | "notas_internas"
>;

const DATOS_VACIOS: ProductoFormData = {
  nombre: "",
  sku: "",
  categoria: "",
  unidad: "Unidad",
  tipo: "bienes",
  rastrear_inventario: true,
  precio: 0,
  costo: 0,
  limite_stock: 0,
  notas_internas: "",
};

export function ProductoForm({
  producto,
  onCancel,
  onSaved,
  onDeleted,
}: {
  producto?: Producto;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [data, setData] = useState<ProductoFormData>(
    producto
      ? {
          nombre: producto.nombre,
          sku: producto.sku,
          categoria: producto.categoria ?? "",
          unidad: producto.unidad,
          tipo: producto.tipo,
          rastrear_inventario: producto.rastrear_inventario,
          precio: producto.precio,
          costo: producto.costo,
          limite_stock: producto.limite_stock,
          notas_internas: producto.notas_internas ?? "",
        }
      : DATOS_VACIOS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ProductoFormData>(key: K, value: ProductoFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(): Promise<boolean> {
    if (!data.nombre.trim() || !data.sku.trim()) {
      setError("Nombre y SKU son obligatorios.");
      return false;
    }

    setIsSaving(true);
    setError(null);
    try {
      // El resto de los campos de Producto (favorito, foto_url, impuesto_venta, etc.) no
      // se editan desde este formulario todavía. La ruta PATCH pisa las 17 columnas que
      // recibe en el body (no es un update parcial), así que en edición hay que mandar el
      // producto entero -- si solo mandáramos los campos de "data" se perderían esos
      // valores existentes.
      const payload = producto
        ? { ...producto, ...data }
        : { ...data, stock: 0, favorito: false, foto_url: null, impuesto_venta: null, codigo_detraccion: null, referencia: null, codigo_barras: null };
      const res = await fetch(producto ? `/api/productos/${producto.id}` : "/api/productos", {
        method: producto ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar el producto.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (await guardar()) onSaved();
  }

  async function handleSaveAndNew() {
    if (!(await guardar())) return;
    setData(DATOS_VACIOS);
  }

  async function handleDelete() {
    if (!producto) return;
    if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/productos/${producto.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el producto.");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  return (
    <FormLayout
      title={producto ? producto.nombre : "Nuevo producto"}
      onSave={handleSave}
      onCancel={onCancel}
      onSaveAndNew={producto ? undefined : handleSaveAndNew}
      onDelete={producto ? handleDelete : undefined}
      isSaving={isSaving}
    >
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Nombre</span>
          <input
            className={fieldStyles.input}
            value={data.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>SKU</span>
          <input
            className={fieldStyles.input}
            value={data.sku}
            onChange={(e) => setField("sku", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Categoría</span>
          <input
            className={fieldStyles.input}
            value={data.categoria ?? ""}
            onChange={(e) => setField("categoria", e.target.value)}
          />
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Tipo</span>
          <select
            className={fieldStyles.select}
            value={data.tipo}
            onChange={(e) => setField("tipo", e.target.value as Producto["tipo"])}
          >
            <option value="bienes">Bienes</option>
            <option value="servicio">Servicio</option>
            <option value="combo">Combo</option>
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Unidad</span>
          <input
            className={fieldStyles.input}
            value={data.unidad}
            onChange={(e) => setField("unidad", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 20 }}>
          <input
            type="checkbox"
            checked={data.rastrear_inventario}
            onChange={(e) => setField("rastrear_inventario", e.target.checked)}
          />
          <span className={fieldStyles.label} style={{ margin: 0 }}>Rastrear en Inventario (Stock, Entradas, Salidas)</span>
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Precio de venta</span>
          <input
            type="number"
            step="0.01"
            className={fieldStyles.input}
            value={data.precio}
            onChange={(e) => setField("precio", Number(e.target.value))}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Costo</span>
          <input
            type="number"
            step="0.01"
            className={fieldStyles.input}
            value={data.costo}
            onChange={(e) => setField("costo", Number(e.target.value))}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Límite de stock (aviso)</span>
          <input
            type="number"
            className={fieldStyles.input}
            value={data.limite_stock}
            onChange={(e) => setField("limite_stock", Number(e.target.value))}
          />
        </label>
      </div>

      {producto && (
        <div className={fieldStyles.row}>
          <label className={fieldStyles.field}>
            <span className={fieldStyles.label}>Stock actual</span>
            <input className={fieldStyles.input} value={`${producto.stock} ${producto.unidad}`} disabled />
          </label>
        </div>
      )}

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Notas internas</span>
        <textarea
          className={fieldStyles.textarea}
          rows={3}
          value={data.notas_internas ?? ""}
          onChange={(e) => setField("notas_internas", e.target.value)}
        />
      </label>
    </FormLayout>
  );
}
