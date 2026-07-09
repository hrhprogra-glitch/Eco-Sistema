"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  Mail,
  Phone,
  Plus,
  Tag,
  User,
  X,
} from "lucide-react";
import type { Contacto } from "../types";
import { EmptyState } from "@/components/EmptyState";
import styles from "./ContactoDetailView.module.css";

type Tab = "contactos" | "ventasCompras" | "contabilidad" | "notas";

function iniciales(nombre: string) {
  const trimmed = nombre.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ContactoDetailView({
  contacto,
  isNew = false,
  isSaving = false,
  onBack,
  onSave,
  onDelete,
}: {
  contacto: Contacto;
  isNew?: boolean;
  isSaving?: boolean;
  onBack: () => void;
  onSave: (contacto: Contacto) => void;
  onDelete?: (contacto: Contacto) => void;
}) {
  const [form, setForm] = useState(contacto);
  const [tab, setTab] = useState<Tab>("contactos");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [nuevoRelacionado, setNuevoRelacionado] = useState("");

  function updateDireccion<K extends keyof Contacto["direccion"]>(
    key: K,
    value: Contacto["direccion"][K]
  ) {
    setForm((prev) => ({ ...prev, direccion: { ...prev.direccion, [key]: value } }));
  }

  function addIdentificacion() {
    setForm((prev) => ({
      ...prev,
      identificaciones: [...prev.identificaciones, { tipo: "", numero: "" }],
    }));
  }

  function updateIdentificacion(index: number, key: "tipo" | "numero", value: string) {
    setForm((prev) => ({
      ...prev,
      identificaciones: prev.identificaciones.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function removeIdentificacion(index: number) {
    setForm((prev) => ({
      ...prev,
      identificaciones: prev.identificaciones.filter((_, i) => i !== index),
    }));
  }

  function addEtiqueta() {
    const value = nuevaEtiqueta.trim();
    if (!value || form.etiquetas.includes(value)) return;
    setForm((prev) => ({ ...prev, etiquetas: [...prev.etiquetas, value] }));
    setNuevaEtiqueta("");
  }

  function removeEtiqueta(etiqueta: string) {
    setForm((prev) => ({ ...prev, etiquetas: prev.etiquetas.filter((e) => e !== etiqueta) }));
  }

  function addRelacionado() {
    const value = nuevoRelacionado.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      contactosRelacionados: [...prev.contactosRelacionados, value],
    }));
    setNuevoRelacionado("");
  }

  function removeRelacionado(nombre: string) {
    setForm((prev) => ({
      ...prev,
      contactosRelacionados: prev.contactosRelacionados.filter((n) => n !== nombre),
    }));
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
          Contactos
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>
          {isNew ? "Nuevo contacto" : form.nombre || "Sin nombre"}
        </span>

        <div className={styles.topBarActions}>
          {!isNew && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(form)}
              className={styles.deleteButton}
              disabled={isSaving}
            >
              Eliminar
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
        <span className={styles.avatar}>{iniciales(form.nombre)}</span>

        <div className={styles.headerFields}>
          <input
            type="text"
            value={form.nombre}
            onChange={(event) => setForm({ ...form, nombre: event.target.value })}
            placeholder="Nombre del contacto"
            className={styles.nameInput}
            required
          />

          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeButton} ${form.esEmpresa ? styles.typeActive : ""}`}
              onClick={() => setForm({ ...form, esEmpresa: true })}
            >
              <Building2 size={14} />
              Empresa
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${!form.esEmpresa ? styles.typeActive : ""}`}
              onClick={() => setForm({ ...form, esEmpresa: false })}
            >
              <User size={14} />
              Individual
            </button>
          </div>

          <div className={styles.inlineField}>
            <Mail size={14} />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Email"
              required
            />
          </div>
          <div className={styles.inlineField}>
            <Phone size={14} />
            <input
              type="tel"
              value={form.telefono}
              onChange={(event) => setForm({ ...form, telefono: event.target.value })}
              placeholder="Teléfono"
              required
            />
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>Dirección</h3>
          <input
            type="text"
            value={form.direccion.calle}
            onChange={(event) => updateDireccion("calle", event.target.value)}
            placeholder="Calle..."
            className={styles.input}
          />
          <input
            type="text"
            value={form.direccion.calle2}
            onChange={(event) => updateDireccion("calle2", event.target.value)}
            placeholder="Calle 2..."
            className={styles.input}
          />
          <input
            type="text"
            value={form.direccion.distrito}
            onChange={(event) => updateDireccion("distrito", event.target.value)}
            placeholder="Distrito..."
            className={styles.input}
          />
          <div className={styles.row3}>
            <input
              type="text"
              value={form.direccion.ciudad}
              onChange={(event) => updateDireccion("ciudad", event.target.value)}
              placeholder="Ciudad"
              className={styles.input}
            />
            <input
              type="text"
              value={form.direccion.estado}
              onChange={(event) => updateDireccion("estado", event.target.value)}
              placeholder="Estado"
              className={styles.input}
            />
            <input
              type="text"
              value={form.direccion.zip}
              onChange={(event) => updateDireccion("zip", event.target.value)}
              placeholder="ZIP"
              className={styles.input}
            />
          </div>
          <input
            type="text"
            value={form.direccion.pais}
            onChange={(event) => updateDireccion("pais", event.target.value)}
            placeholder="País"
            className={styles.input}
          />

          <h3 className={styles.sectionTitle}>Número de identificación</h3>
          {form.identificaciones.map((identificacion, index) => (
            <div key={index} className={styles.idRow}>
              <input
                type="text"
                value={identificacion.tipo}
                onChange={(event) => updateIdentificacion(index, "tipo", event.target.value)}
                placeholder="Tipo (ej. DNI, RUC)"
                className={styles.input}
              />
              <input
                type="text"
                value={identificacion.numero}
                onChange={(event) => updateIdentificacion(index, "numero", event.target.value)}
                placeholder="Número"
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => removeIdentificacion(index)}
                className={styles.iconButton}
                aria-label="Quitar identificación"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addIdentificacion} className={styles.addLink}>
            <Plus size={14} />
            Agregar identificación
          </button>
        </div>

        <div className={styles.column}>
          <label className={styles.fieldLabel}>
            Clasificación
            <select
              value={form.tipo}
              onChange={(event) =>
                setForm({ ...form, tipo: event.target.value as Contacto["tipo"] })
              }
              className={styles.input}
            >
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="otro">Otro</option>
            </select>
          </label>

          <label className={styles.fieldLabel}>
            <span className={styles.labelWithIcon}>
              <Briefcase size={14} /> Puesto de trabajo
            </span>
            <input
              type="text"
              value={form.puestoTrabajo}
              onChange={(event) => setForm({ ...form, puestoTrabajo: event.target.value })}
              placeholder="Por ejemplo, director de ventas"
              className={styles.input}
            />
          </label>

          <label className={styles.fieldLabel}>
            <span className={styles.labelWithIcon}>
              <Globe size={14} /> Sitio web
            </span>
            <input
              type="text"
              value={form.sitioWeb}
              onChange={(event) => setForm({ ...form, sitioWeb: event.target.value })}
              placeholder="Por ejemplo, https://www.tuempresa.com"
              className={styles.input}
            />
          </label>

          <span className={styles.labelWithIcon}>
            <Tag size={14} /> Etiquetas
          </span>
          <div className={styles.tags}>
            {form.etiquetas.map((etiqueta) => (
              <span key={etiqueta} className={styles.tagChip}>
                {etiqueta}
                <button type="button" onClick={() => removeEtiqueta(etiqueta)} aria-label="Quitar etiqueta">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={nuevaEtiqueta}
              onChange={(event) => setNuevaEtiqueta(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addEtiqueta();
                }
              }}
              placeholder="Por ejemplo, B2B, VIP..."
              className={styles.tagInput}
            />
          </div>
        </div>
      </div>

      <aside className={styles.sideColumn}>
        <div className={styles.tabs}>
          {(
            [
              ["contactos", "Contactos"],
              ["ventasCompras", "Ventas y compras"],
              ["contabilidad", "Contabilidad"],
              ["notas", "Notas"],
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
          {tab === "contactos" && (
            <div className={styles.relacionados}>
              {form.contactosRelacionados.map((nombre) => (
                <span key={nombre} className={styles.tagChip}>
                  {nombre}
                  <button type="button" onClick={() => removeRelacionado(nombre)} aria-label="Quitar">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className={styles.relacionadosAdd}>
                <input
                  type="text"
                  value={nuevoRelacionado}
                  onChange={(event) => setNuevoRelacionado(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addRelacionado();
                    }
                  }}
                  placeholder="Nombre del contacto relacionado"
                  className={styles.input}
                />
                <button type="button" onClick={addRelacionado} className={styles.addLink}>
                  <Plus size={14} />
                  Agregar contacto relacionado
                </button>
              </div>
            </div>
          )}

          {tab === "ventasCompras" && (
            <EmptyState
              icon={Building2}
              title="Todavía sin datos de ventas y compras"
              description="Se completa automáticamente cuando este contacto tenga movimientos en Ventas."
            />
          )}

          {tab === "contabilidad" && (
            <EmptyState
              icon={Building2}
              title="Todavía sin datos contables"
              description="Se completa automáticamente cuando este contacto tenga movimientos en Contabilidad."
            />
          )}

          {tab === "notas" && (
            <textarea
              value={form.notas}
              onChange={(event) => setForm({ ...form, notas: event.target.value })}
              placeholder="Escribí una nota sobre este contacto..."
              className={styles.textarea}
            />
          )}
        </div>
      </aside>
      </div>
    </form>
  );
}
