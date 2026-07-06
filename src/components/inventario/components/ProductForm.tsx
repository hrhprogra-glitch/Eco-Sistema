"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, HelpCircle, Package, Plus, Star, X } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { Producto } from "../types";
import styles from "./ProductForm.module.css";

type Tab = "general" | "inventario" | "contabilidad";
type ProductoInput = Omit<Producto, "id" | "created_at">;

const EMPTY_PRODUCTO: ProductoInput = {
  nombre: "",
  sku: "",
  stock: 0,
  precio: 0,
  favorito: false,
  foto_url: null,
  limite_stock: 0,
  tipo: "bienes",
  rastrear_inventario: false,
  unidad: "Unidad",
  impuesto_venta: null,
  codigo_detraccion: null,
  costo: 0,
  categoria: null,
  referencia: null,
  codigo_barras: null,
  notas_internas: null,
};

export function ProductForm({
  initialData,
  onSave,
  onCancel,
  onDelete,
  isSaving,
}: {
  initialData?: Producto | null;
  onSave: (product: ProductoInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProductoInput>(initialData ?? EMPTY_PRODUCTO);
  const [tab, setTab] = useState<Tab>("general");
  const [nuevoImpuesto, setNuevoImpuesto] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProductoInput>(key: K, value: ProductoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        update("foto_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      className={styles.wrapper}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className={styles.topBar}>
        <button type="button" onClick={onCancel} className={styles.back}>
          <ArrowLeft size={15} />
          Productos
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>
          {form.nombre || (initialData ? "Sin nombre" : "Nuevo producto")}
        </span>

        <div className={styles.topBarActions}>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={styles.discardButton}
              style={{ color: '#ef4444', borderColor: 'transparent', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              disabled={isSaving}
            >
              Eliminar
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
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
        <div className={styles.identity}>
          <button
            type="button"
            className={styles.favButton}
            onClick={() => update("favorito", !form.favorito)}
            aria-label="Marcar como favorito"
          >
            <Star size={22} fill={form.favorito ? "currentColor" : "none"} />
          </button>
          <input
            type="text"
            value={form.nombre}
            onChange={(event) => update("nombre", event.target.value)}
            placeholder="Por ejemplo, hamburguesa de queso"
            className={styles.nameInput}
            required
          />
        </div>

        <div className={styles.photoUpload} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
          {form.foto_url ? (
            <img src={form.foto_url} alt="" className={styles.photoPreview} />
          ) : (
            <Camera size={26} className={styles.photoIcon} />
          )}
          <span className={styles.photoAddIcon}>
            <Plus size={12} />
          </span>
        </div>
      </div>



      <div className={styles.mainGrid}>
      <div className={styles.mainColumn}>
      <div className={styles.tabs}>
        {(
          [
            ["general", "Información general"],
            ["inventario", "Inventario"],
            ["contabilidad", "Contabilidad"],
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
        {tab === "general" && (
          <div className={styles.generalGrid}>
            <div className={styles.column}>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Tipo de producto</span>
                <div className={styles.radioRow}>
                  {(
                    [
                      ["bienes", "Bienes"],
                      ["servicio", "Servicio"],
                      ["combo", "Combo"],
                    ] as [ProductoInput["tipo"], string][]
                  ).map(([value, label]) => (
                    <label key={value} className={styles.radioItem}>
                      <input
                        type="radio"
                        name="tipo"
                        checked={form.tipo === value}
                        onChange={() => update("tipo", value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Cantidad a la mano (Stock)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock || ""}
                    placeholder="0"
                    onChange={(event) => update("stock", Number(event.target.value))}
                    className={styles.inlineInput}
                  />
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Límite de stock</span>
                  <input
                    type="number"
                    min="0"
                    value={form.limite_stock || ""}
                    placeholder="0"
                    onChange={(event) => update("limite_stock", Number(event.target.value))}
                    className={styles.inlineInput}
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Alerta de producto</span>
                <button
                  type="button"
                  className={`${styles.switch} ${form.rastrear_inventario ? styles.switchOn : ""}`}
                  onClick={() => update("rastrear_inventario", !form.rastrear_inventario)}
                  aria-pressed={form.rastrear_inventario}
                >
                  <span className={styles.switchKnob} />
                </button>
              </div>

            </div>

            <div className={styles.column}>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Precio de venta</span>
                <div className={styles.priceGroup}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio || ""}
                    placeholder="0"
                    onChange={(event) => update("precio", Number(event.target.value))}
                    className={styles.inlineInput}
                  />
                  <span className={styles.unitLabel}>por {form.unidad}</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Impuestos de venta</span>
                {form.impuesto_venta ? (
                  <span className={styles.taxChip}>
                    {form.impuesto_venta}
                    <button
                      type="button"
                      onClick={() => update("impuesto_venta", null)}
                      aria-label="Quitar impuesto"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                  <input
                    type="text"
                    value={nuevoImpuesto}
                    onChange={(event) => setNuevoImpuesto(event.target.value)}
                    onBlur={() => {
                      if (nuevoImpuesto.trim()) {
                        update("impuesto_venta", nuevoImpuesto.trim());
                        setNuevoImpuesto("");
                      }
                    }}
                    placeholder="Ej. IGV 18%"
                    className={styles.inlineInput}
                  />
                )}
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Código de detracción</span>
                <input
                  type="text"
                  value={form.codigo_detraccion ?? ""}
                  onChange={(event) => update("codigo_detraccion", event.target.value || null)}
                  className={styles.inlineInput}
                />
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Costo</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costo || ""}
                  placeholder="0"
                  onChange={(event) => update("costo", Number(event.target.value))}
                  className={styles.inlineInput}
                />
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Categoría</span>
                <select
                  value={form.categoria ?? ""}
                  onChange={(event) => update("categoria", event.target.value || null)}
                  className={styles.inlineInput}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Equipos">Equipos</option>
                  <option value="Electrobombas">Electrobombas</option>
                  <option value="Piscinas">Piscinas</option>
                </select>
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Referencia interna</span>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) => update("sku", event.target.value)}
                  className={styles.inlineInput}
                  required
                />
              </div>

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Código de barras</span>
                <input
                  type="text"
                  value={form.codigo_barras ?? ""}
                  onChange={(event) => update("codigo_barras", event.target.value || null)}
                  className={styles.inlineInput}
                />
              </div>
            </div>
          </div>
        )}

        {tab === "inventario" && (
          <EmptyState
            icon={Package}
            title="Todavía sin movimientos de inventario"
            description="Acá vas a ver entradas, salidas y ajustes de stock de este producto."
          />
        )}

        {tab === "contabilidad" && (
          <EmptyState
            icon={Package}
            title="Todavía sin datos contables"
            description="Se completa automáticamente cuando este producto tenga movimientos en Contabilidad."
          />
        )}
      </div>
      </div>

      <aside className={styles.sideColumn}>
        <div className={styles.notesSection}>
          <h3 className={styles.sectionTitle}>Notas internas</h3>
          <textarea
            value={form.notas_internas ?? ""}
            onChange={(event) => update("notas_internas", event.target.value || null)}
            placeholder="Esta nota es solo para fines internos."
            className={styles.textarea}
          />
        </div>
      </aside>
      </div>
    </form>
  );
}
