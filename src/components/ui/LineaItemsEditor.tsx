"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Producto } from "@/components/inventario/types";
import fieldStyles from "./formFields.module.css";
import styles from "./LineaItemsEditor.module.css";

export type LineaItem = {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export function LineaItemsEditor({
  value,
  onChange,
}: {
  value: LineaItem[];
  onChange: (lineas: LineaItem[]) => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Producto[]) => setProductos(data))
      .catch(() => setProductos([]));
  }, []);

  function updateLinea(index: number, patch: Partial<LineaItem>) {
    onChange(value.map((linea, i) => (i === index ? { ...linea, ...patch } : linea)));
  }

  function handleProductoChange(index: number, productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    const precio = producto?.precio ?? 0;
    const cantidad = value[index].cantidad || 1;
    updateLinea(index, {
      producto_id: productoId,
      precio_unitario: precio,
      cantidad,
      subtotal: precio * cantidad,
    });
  }

  function handleCantidadChange(index: number, cantidad: number) {
    updateLinea(index, { cantidad, subtotal: cantidad * value[index].precio_unitario });
  }

  function handlePrecioChange(index: number, precio: number) {
    updateLinea(index, { precio_unitario: precio, subtotal: precio * value[index].cantidad });
  }

  function addLinea() {
    onChange([...value, { producto_id: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  }

  function removeLinea(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const total = value.reduce((sum, linea) => sum + linea.subtotal, 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <span>Producto</span>
        <span>Cantidad</span>
        <span>Precio unitario</span>
        <span>Subtotal</span>
        <span />
      </div>
      {value.map((linea, index) => (
        <div key={index} className={styles.row}>
          <select
            className={fieldStyles.select}
            value={linea.producto_id}
            onChange={(e) => handleProductoChange(index, e.target.value)}
          >
            <option value="">Seleccionar producto…</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={linea.cantidad}
            onChange={(e) => handleCantidadChange(index, Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={linea.precio_unitario}
            onChange={(e) => handlePrecioChange(index, Number(e.target.value))}
          />
          <span className={styles.subtotal}>{linea.subtotal.toFixed(2)}</span>
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeLinea(index)}
            aria-label="Quitar línea"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={addLinea}>
        <Plus size={16} />
        Agregar línea
      </button>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
