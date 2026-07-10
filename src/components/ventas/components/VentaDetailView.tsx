"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import type { Venta, VentaInput, VentaLinea } from "../types";
import styles from "./VentaDetailView.module.css";
import type { Producto } from "@/components/inventario/types";

type ContactoOption = { id: string; nombre: string };

export function VentaDetailView({
  venta,
  isNew,
  isSaving,
  contactos,
  productos,
  onBack,
  onSave,
  onDelete,
}: {
  venta: Venta | VentaInput;
  isNew: boolean;
  isSaving: boolean;
  contactos: ContactoOption[];
  productos: Producto[];
  onBack: () => void;
  onSave: (data: VentaInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [formData, setFormData] = useState<VentaInput>({
    contacto_id: venta.contacto_id || "",
    estado: venta.estado || "borrador",
    fecha: venta.fecha || new Date().toISOString().split("T")[0],
    notas: venta.notas || "",
    total: venta.total || 0,
    lineas: venta.lineas || [],
  });

  // Calculate total automatically
  const calculatedTotal = useMemo(() => {
    return (formData.lineas || []).reduce((acc, linea) => acc + (linea.subtotal || 0), 0);
  }, [formData.lineas]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, total: calculatedTotal }));
  }, [calculatedTotal]);

  const handleChange = (field: keyof VentaInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lineas: [
        ...(prev.lineas || []),
        { producto_id: "", cantidad: 1, precio_unitario: 0, subtotal: 0 },
      ],
    }));
  };

  const handleUpdateLine = (index: number, field: keyof VentaLinea, value: string | number) => {
    setFormData((prev) => {
      const newLineas = [...(prev.lineas || [])];
      const linea = { ...newLineas[index], [field]: value } as VentaLinea;

      if (field === "producto_id") {
        const prod = productos.find(p => p.id === value);
        if (prod) {
          linea.precio_unitario = Number(prod.precio);
          linea.subtotal = linea.cantidad * linea.precio_unitario;
        }
      } else if (field === "cantidad" || field === "precio_unitario") {
        linea.subtotal = linea.cantidad * linea.precio_unitario;
      }

      newLineas[index] = linea;
      return { ...prev, lineas: newLineas };
    });
  };

  const handleRemoveLine = (index: number) => {
    setFormData((prev) => {
      const newLineas = [...(prev.lineas || [])];
      newLineas.splice(index, 1);
      return { ...prev, lineas: newLineas };
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={styles.title}>
            {isNew ? "Nueva Venta" : `Venta S00${(venta as Venta).numero}`}
          </h2>
          {!isNew && (
            <span className={styles.statusBadge}>{formData.estado}</span>
          )}
        </div>
        <div className={styles.actions}>
          {!isNew && onDelete && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDelete}`}
              onClick={() => {
                if (window.confirm("¿Seguro que querés eliminar esta venta?")) {
                  onDelete();
                }
              }}
              disabled={isSaving}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
          <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onBack}>
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSave}`}
            onClick={() => onSave(formData)}
            disabled={isSaving || formData.contacto_id === ""}
          >
            <Save size={16} />
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información General</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Cliente</label>
              <select
                className={styles.select}
                value={formData.contacto_id}
                onChange={(e) => handleChange("contacto_id", e.target.value)}
              >
                <option value="">-- Seleccionar Cliente --</option>
                {contactos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Fecha</label>
              <input
                type="date"
                className={styles.input}
                value={formData.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.select}
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
              >
                <option value="borrador">Borrador / Cotización</option>
                <option value="confirmada">Confirmada</option>
                <option value="facturada">Facturada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Líneas de Venta</h3>
          <div className={styles.tableContainer}>
            <table className={styles.linesTable}>
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Producto</th>
                  <th style={{ width: "15%" }}>Cantidad</th>
                  <th style={{ width: "20%" }}>Precio Unitario</th>
                  <th style={{ width: "20%" }}>Subtotal</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                {(formData.lineas || []).map((linea, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className={styles.lineInput}
                        value={linea.producto_id}
                        onChange={(e) => handleUpdateLine(idx, "producto_id", e.target.value)}
                      >
                        <option value="">-- Producto --</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className={styles.lineInput}
                        value={linea.cantidad || ""}
                        onChange={(e) => handleUpdateLine(idx, "cantidad", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        className={styles.lineInput}
                        value={linea.precio_unitario || ""}
                        onChange={(e) => handleUpdateLine(idx, "precio_unitario", Number(e.target.value))}
                      />
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      S/ {Number(linea.subtotal || 0).toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.removeLineBtn}
                        onClick={() => handleRemoveLine(idx)}
                        title="Eliminar línea"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className={styles.addLineBtn} onClick={handleAddLine}>
              <Plus size={16} /> Agregar Producto
            </button>
          </div>
        </div>

        <div className={styles.totalContainer}>
          <div className={styles.totalRow}>
            <span>Subtotal de Líneas:</span>
            <span>S/ {calculatedTotal.toFixed(2)}</span>
          </div>
          <div className={styles.grandTotalRow}>
            <span>Total Venta:</span>
            <span>S/ {calculatedTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notas Internas</h3>
          <textarea
            className={styles.textarea}
            value={formData.notas || ""}
            onChange={(e) => handleChange("notas", e.target.value)}
            placeholder="Notas sobre el envío, condiciones de pago, etc."
          />
        </div>
      </div>
    </div>
  );
}
