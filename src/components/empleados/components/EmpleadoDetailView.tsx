"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Camera,
  IdCard,
  Mail,
  Phone,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { Empleado } from "../types";
import styles from "./EmpleadoDetailView.module.css";

type Tab = "trabajo" | "privada" | "rrhh";

export function EmpleadoDetailView({
  empleado,
  isNew = false,
  isSaving = false,
  onBack,
  onSave,
  onDelete,
}: {
  empleado: Empleado;
  isNew?: boolean;
  isSaving?: boolean;
  onBack: () => void;
  onSave: (empleado: Empleado) => void;
  onDelete?: (empleado: Empleado) => void;
}) {
  const [form, setForm] = useState(empleado);
  const [tab, setTab] = useState<Tab>("trabajo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dniFileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof Empleado>(key: K, value: Empleado[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("foto_url", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDniImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("dni_foto_url", reader.result as string);
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
          <ArrowLeft size={15} />
          Empleados
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>
          {isNew ? "Nuevo empleado" : form.nombre || "Sin nombre"}
        </span>

        <div className={styles.topBarActions}>
          {!isNew && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Eliminar a ${form.nombre || "este empleado"}? Esta acción no se puede deshacer.`)) {
                  onDelete(form);
                }
              }}
              className={styles.deleteButton}
              disabled={isSaving}
              aria-label="Eliminar empleado"
              title="Eliminar empleado"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className={styles.discardButton}
            disabled={isSaving}
          >
            Descartar
          </button>
          <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className={styles.headerRow}>
        <div
          className={styles.photoUpload}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          {form.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.foto_url} alt="" className={styles.photoPreview} />
          ) : (
            <User size={30} className={styles.photoIcon} />
          )}
          <span className={styles.photoAddIcon}>
            <Camera size={11} />
          </span>
        </div>

        <div className={styles.headerFields}>
          <input
            type="text"
            value={form.nombre}
            onChange={(event) => update("nombre", event.target.value)}
            placeholder="Nombre del empleado"
            className={styles.nameInput}
            required
          />
          <input
            type="text"
            value={form.puesto}
            onChange={(event) => update("puesto", event.target.value)}
            placeholder="Puesto de trabajo"
            className={styles.jobInput}
          />
        </div>
      </div>

      <div className={styles.tabs}>
        {(
          [
            ["trabajo", "Información de trabajo"],
            ["privada", "Información privada"],
            ["rrhh", "Configuración de RRHH"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`${styles.tab} ${tab === value ? styles.tabActive : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === "trabajo" && (
          <div className={styles.grid}>
            <div className={styles.column}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Building2 size={14} /> Departamento / Área
                </span>
                <input
                  type="text"
                  value={form.area}
                  onChange={(event) => update("area", event.target.value)}
                  className={styles.input}
                  required
                />
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Briefcase size={14} /> Jefe directo
                </span>
                <input
                  type="text"
                  value={form.jefe_directo ?? ""}
                  onChange={(event) => update("jefe_directo", event.target.value || null)}
                  className={styles.input}
                />
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Wallet size={14} /> Monto de pago
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto_pago}
                  onChange={(event) => update("monto_pago", Number(event.target.value))}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.column}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Mail size={14} /> Correo de trabajo
                </span>
                <input
                  type="email"
                  value={form.email_trabajo ?? ""}
                  onChange={(event) => update("email_trabajo", event.target.value || null)}
                  className={styles.input}
                />
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Phone size={14} /> Teléfono de trabajo
                </span>
                <input
                  type="tel"
                  value={form.telefono_trabajo ?? ""}
                  onChange={(event) => update("telefono_trabajo", event.target.value || null)}
                  className={styles.input}
                />
              </label>
            </div>
          </div>
        )}

        {tab === "privada" && (
          <div className={styles.grid}>
            <div className={styles.column}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <IdCard size={14} /> Número de DNI
                </span>
                <input
                  type="text"
                  value={form.dni ?? ""}
                  onChange={(event) => update("dni", event.target.value || null)}
                  placeholder="Ej. 12345678"
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.column}>
              <span className={styles.fieldLabel}>Foto del DNI</span>
              <div
                className={styles.dniUpload}
                onClick={() => dniFileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={dniFileInputRef}
                  onChange={handleDniImageUpload}
                  style={{ display: "none" }}
                />
                {form.dni_foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.dni_foto_url} alt="DNI" className={styles.dniPreview} />
                ) : (
                  <>
                    <IdCard size={22} className={styles.dniIcon} />
                    <span className={styles.dniLabel}>Subir foto del DNI</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "rrhh" && (
          <EmptyState
            icon={Briefcase}
            title="Todavía sin configuración de RRHH"
            description="Acá vas a poder definir tipo de contrato, horario y otros datos de RRHH."
          />
        )}
      </div>
    </form>
  );
}
