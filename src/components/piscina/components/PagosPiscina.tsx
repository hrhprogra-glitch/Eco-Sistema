"use client";

import { useState } from "react";
import { AlertTriangle, Check, Pencil, Plus, Trash2, Wallet, X } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { PiscinaPago, PiscinaPagoInput } from "../types";
import { esPagoProximo, esPagoVencido } from "../alertas";
import styles from "./PagosPiscina.module.css";

function primerDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function ultimoDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function vacio(piscinaId: number): PiscinaPagoInput {
  return {
    piscina_id: piscinaId,
    monto: 0,
    periodo_inicio: primerDiaMes(),
    periodo_fin: ultimoDiaMes(),
    pagado: false,
    fecha_pago: null,
    notas: "",
  };
}

function estadoPago(pago: PiscinaPago): { label: string; className: string } {
  if (pago.pagado) return { label: "Pagado", className: styles.badgePagado };
  if (esPagoVencido(pago)) return { label: "Vencido", className: styles.badgeVencido };
  if (esPagoProximo(pago)) return { label: "Próximo a vencer", className: styles.badgeProximo };
  return { label: "Pendiente", className: styles.badgePendiente };
}

export function PagosPiscina({
  piscinaId,
  pagos,
  onAdd,
  onUpdate,
  onDelete,
}: {
  piscinaId: number;
  pagos: PiscinaPago[];
  onAdd: (input: PiscinaPagoInput) => Promise<void>;
  onUpdate: (id: number, input: PiscinaPagoInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState<PiscinaPagoInput>(vacio(piscinaId));
  const [editingId, setEditingId] = useState<number | null>(null);

  function update<K extends keyof PiscinaPagoInput>(key: K, value: PiscinaPagoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(pago: PiscinaPago) {
    setEditingId(pago.id);
    setForm({
      piscina_id: pago.piscina_id,
      monto: pago.monto,
      periodo_inicio: pago.periodo_inicio.slice(0, 10),
      periodo_fin: pago.periodo_fin.slice(0, 10),
      pagado: pago.pagado,
      fecha_pago: pago.fecha_pago ? pago.fecha_pago.slice(0, 10) : null,
      notas: pago.notas,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(vacio(piscinaId));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onAdd(form);
    }
    setEditingId(null);
    setForm(vacio(piscinaId));
  }

  async function marcarPagado(pago: PiscinaPago) {
    await onUpdate(pago.id, {
      piscina_id: pago.piscina_id,
      monto: pago.monto,
      periodo_inicio: pago.periodo_inicio.slice(0, 10),
      periodo_fin: pago.periodo_fin.slice(0, 10),
      pagado: true,
      fecha_pago: new Date().toISOString().slice(0, 10),
      notas: pago.notas,
    });
  }

  async function handleDelete(pago: PiscinaPago) {
    if (!window.confirm("¿Eliminar este registro de pago?")) return;
    await onDelete(pago.id);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.listColumn}>
        {pagos.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Sin pagos registrados"
            description="Cuando registres un cobro para esta piscina, va a aparecer acá."
          />
        ) : (
          <div className={styles.list}>
            {pagos.map((pago) => {
              const estado = estadoPago(pago);
              return (
                <div key={pago.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTop}>
                      <span className={`${styles.badge} ${estado.className}`}>
                        {(estado.label === "Vencido" || estado.label === "Próximo a vencer") && (
                          <AlertTriangle size={11} />
                        )}
                        {estado.label}
                      </span>
                      <span className={styles.itemMonto}>S/ {pago.monto.toFixed(2)}</span>
                    </div>
                    <span className={styles.itemPeriodo}>
                      {new Date(`${pago.periodo_inicio.slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE")}
                      {" – "}
                      {new Date(`${pago.periodo_fin.slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE")}
                    </span>
                    {pago.notas && <span className={styles.itemNotas}>{pago.notas}</span>}
                  </div>
                  <div className={styles.itemActions}>
                    {!pago.pagado && (
                      <button
                        type="button"
                        onClick={() => marcarPagado(pago)}
                        className={styles.iconButton}
                        title="Marcar como pagado"
                        aria-label="Marcar como pagado"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(pago)}
                      className={styles.iconButton}
                      aria-label="Editar pago"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pago)}
                      className={styles.iconButton}
                      aria-label="Eliminar pago"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.formTitle}>{editingId ? "Editar pago" : "Registrar pago"}</h3>

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

        <div className={styles.row2}>
          <label className={styles.fieldLabel}>
            Desde
            <input
              type="date"
              value={form.periodo_inicio}
              onChange={(event) => update("periodo_inicio", event.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.fieldLabel}>
            Hasta (vencimiento)
            <input
              type="date"
              value={form.periodo_fin}
              onChange={(event) => update("periodo_fin", event.target.value)}
              className={styles.input}
            />
          </label>
        </div>

        <button
          type="button"
          className={styles.presetButton}
          onClick={() => {
            update("periodo_inicio", primerDiaMes());
            update("periodo_fin", ultimoDiaMes());
          }}
        >
          Usar mes actual
        </button>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.pagado}
            onChange={(event) => {
              const pagado = event.target.checked;
              update("pagado", pagado);
              update("fecha_pago", pagado ? new Date().toISOString().slice(0, 10) : null);
            }}
          />
          Ya está pagado
        </label>

        {form.pagado && (
          <label className={styles.fieldLabel}>
            Fecha de pago
            <input
              type="date"
              value={form.fecha_pago ?? ""}
              onChange={(event) => update("fecha_pago", event.target.value)}
              className={styles.input}
            />
          </label>
        )}

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
            <Plus size={14} /> {editingId ? "Guardar cambios" : "Registrar pago"}
          </button>
        </div>
      </form>
    </div>
  );
}
