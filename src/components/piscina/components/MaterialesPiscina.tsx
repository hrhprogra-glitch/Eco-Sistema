"use client";

import { useEffect, useState } from "react";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { PiscinaMaterial, PiscinaMaterialInput } from "../types";
import styles from "./MaterialesPiscina.module.css";

const VACIO: PiscinaMaterialInput = {
  nombre_material: "",
  cantidad: 1,
  monto: 0,
  fecha: new Date().toISOString().slice(0, 10),
  notas: "",
};

export function MaterialesPiscina({ piscinaId }: { piscinaId: number }) {
  const [materiales, setMateriales] = useState<PiscinaMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PiscinaMaterialInput>(VACIO);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchMateriales = async () => {
    setLoading(true);
    const res = await fetch(`/api/piscinas/${piscinaId}/materiales`);
    if (res.ok) setMateriales(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchMateriales();
  }, [piscinaId]);

  function update<K extends keyof PiscinaMaterialInput>(key: K, value: PiscinaMaterialInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(material: PiscinaMaterial) {
    setEditingId(material.id);
    setForm({
      nombre_material: material.nombre_material,
      cantidad: material.cantidad,
      monto: material.monto,
      fecha: material.fecha.slice(0, 10),
      notas: material.notas,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(VACIO);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.nombre_material.trim()) return;

    const res = editingId
      ? await fetch(`/api/piscinas/${piscinaId}/materiales/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch(`/api/piscinas/${piscinaId}/materiales`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

    if (res.ok) {
      setEditingId(null);
      setForm(VACIO);
      await fetchMateriales();
    }
  }

  async function handleDelete(material: PiscinaMaterial) {
    if (!window.confirm(`¿Quitar "${material.nombre_material}" del registro?`)) return;
    const res = await fetch(`/api/piscinas/${piscinaId}/materiales/${material.id}`, {
      method: "DELETE",
    });
    if (res.ok) await fetchMateriales();
  }

  const total = materiales.reduce((sum, m) => sum + m.monto, 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.listColumn}>
        <div className={styles.totalBar}>
          <span>Total gastado en materiales</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        {loading ? (
          <p className={styles.loading}>Cargando materiales...</p>
        ) : materiales.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sin materiales registrados"
            description="Cuando registres un material usado en esta piscina, va a aparecer acá."
          />
        ) : (
          <div className={styles.list}>
            {materiales.map((material) => (
              <div key={material.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemNombre}>{material.nombre_material}</span>
                  <span className={styles.itemDetalle}>
                    Cantidad: {material.cantidad} · S/ {material.monto.toFixed(2)} ·{" "}
                    {new Date(`${material.fecha.slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE")}
                  </span>
                  {material.notas && <span className={styles.itemNotas}>{material.notas}</span>}
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    onClick={() => startEdit(material)}
                    className={styles.iconButton}
                    aria-label="Editar material"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(material)}
                    className={styles.iconButton}
                    aria-label="Eliminar material"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.formTitle}>{editingId ? "Editar material" : "Registrar material"}</h3>

        <label className={styles.fieldLabel}>
          Material
          <input
            type="text"
            value={form.nombre_material}
            onChange={(event) => update("nombre_material", event.target.value)}
            placeholder="Ej. Cloro granulado"
            className={styles.input}
          />
        </label>

        <div className={styles.row2}>
          <label className={styles.fieldLabel}>
            Cantidad
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cantidad}
              onChange={(event) => update("cantidad", Number(event.target.value))}
              className={styles.input}
            />
          </label>

          <label className={styles.fieldLabel}>
            Monto (S/)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(event) => update("monto", Number(event.target.value))}
              className={styles.input}
            />
          </label>
        </div>

        <label className={styles.fieldLabel}>
          Fecha
          <input
            type="date"
            value={form.fecha}
            onChange={(event) => update("fecha", event.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.fieldLabel}>
          Notas
          <textarea
            value={form.notas}
            onChange={(event) => update("notas", event.target.value)}
            placeholder="Detalles adicionales..."
            className={styles.textarea}
          />
        </label>

        <div className={styles.formActions}>
          {editingId && (
            <button type="button" onClick={cancelEdit} className={styles.cancelButton}>
              <X size={14} /> Cancelar
            </button>
          )}
          <button type="submit" className={styles.addButton}>
            <Plus size={14} /> {editingId ? "Guardar cambios" : "Registrar material"}
          </button>
        </div>
      </form>
    </div>
  );
}
