"use client";

import { useRef, useState } from "react";
import { Calendar, Camera, CheckCircle2, Clock, Receipt, Tag, Trash2 } from "lucide-react";
import type { Gasto } from "../types";
import styles from "./GastoDetailView.module.css";

export function GastoDetailView({
  gasto,
  isNew = false,
  isSaving = false,
  onBack,
  onSave,
  onDelete,
}: {
  gasto: Gasto;
  isNew?: boolean;
  isSaving?: boolean;
  onBack: () => void;
  onSave: (gasto: Gasto) => void;
  onDelete?: (gasto: Gasto) => void;
}) {
  const [form, setForm] = useState(gasto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof Gasto>(key: K, value: Gasto[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleComprobanteUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("comprobante_url", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form
      className={styles.wrapper}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className={styles.topBar}>
        <button type="button" onClick={onBack} className={styles.back}>
          Gastos
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>
          {isNew ? "Nuevo gasto" : form.concepto || "Sin concepto"}
        </span>

        <div className={styles.topBarActions}>
          {!isNew && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Eliminar el gasto "${form.concepto || "sin nombre"}"? Esta acción no se puede deshacer.`)) {
                  onDelete(form);
                }
              }}
              className={styles.deleteButton}
              disabled={isSaving}
              aria-label="Eliminar gasto"
              title="Eliminar gasto"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button type="button" onClick={onBack} className={styles.discardButton} disabled={isSaving}>
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
          value={form.concepto}
          onChange={(event) => update("concepto", event.target.value)}
          placeholder="Concepto del gasto"
          className={styles.nameInput}
          required
        />
        <div className={styles.montoWrapper}>
          <span className={styles.montoPrefix}>S/</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.monto}
            onChange={(event) => update("monto", Number(event.target.value))}
            className={styles.montoInput}
            required
          />
        </div>
      </div>

      <div className={styles.estadoToggle}>
        <button
          type="button"
          onClick={() => update("estado", "pendiente")}
          className={`${styles.estadoButton} ${form.estado === "pendiente" ? styles.estadoPendienteActive : ""}`}
        >
          <Clock size={14} /> Pendiente
        </button>
        <button
          type="button"
          onClick={() => update("estado", "pagado")}
          className={`${styles.estadoButton} ${form.estado === "pagado" ? styles.estadoPagadoActive : ""}`}
        >
          <CheckCircle2 size={14} /> Pagado
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.column}>
          <label className={styles.fieldLabel}>
            <span className={styles.labelWithIcon}>
              <Tag size={14} /> Categoría
            </span>
            <input
              type="text"
              value={form.categoria}
              onChange={(event) => update("categoria", event.target.value)}
              placeholder="Ej. Servicios, Sueldos, Insumos..."
              className={styles.input}
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            <span className={styles.labelWithIcon}>
              <Calendar size={14} /> Fecha del gasto
            </span>
            <input
              type="date"
              value={form.fecha}
              onChange={(event) => update("fecha", event.target.value)}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            Notas
            <textarea
              value={form.notas ?? ""}
              onChange={(event) => update("notas", event.target.value || null)}
              placeholder="Detalles adicionales sobre este gasto..."
              className={styles.textarea}
            />
          </label>
        </div>

        <div className={styles.column}>
          <span className={styles.fieldLabel}>Comprobante</span>
          <div
            className={styles.comprobanteUpload}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleComprobanteUpload}
              style={{ display: "none" }}
            />
            {form.comprobante_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.comprobante_url} alt="Comprobante" className={styles.comprobantePreview} />
            ) : (
              <>
                <Receipt size={22} className={styles.comprobanteIcon} />
                <span className={styles.comprobanteLabel}>Subir foto del comprobante</span>
              </>
            )}
            <span className={styles.comprobanteAddIcon}>
              <Camera size={11} />
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
