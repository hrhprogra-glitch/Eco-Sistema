"use client";

import { useMemo, useState } from "react";
import type { Producto } from "@/components/inventario/types";
import styles from "./ProductoSelector.module.css";

// Buscador de producto reusado en toda la app donde antes había un <select> plano
// (Compras > líneas de la factura, Stock > ajuste por almacén, etc.): cada instancia
// necesita su propio texto/estado de "abierto", así que vive en un componente aparte.
// No tiene opción de "crear": un producto nuevo necesita SKU, precio, categoría, etc.
// -no se puede inventar solo con lo que se tipeó acá-.
export function ProductoSelector({
  value,
  productos,
  disabled,
  hint,
  placeholder = "Buscar producto…",
  onSelect,
  pendingName,
  onPendingNameChange,
}: {
  value: string;
  productos: Producto[];
  disabled?: boolean;
  hint?: string;
  placeholder?: string;
  onSelect: (productoId: string) => void;
  // Nombre detectado al importar un PDF (o tipeado a mano) para un producto que todavía
  // no existe en el catálogo: se muestra editable en el mismo campo -no como un simple
  // texto de ayuda de solo lectura- para poder corregir un error de lectura antes de que
  // se dé de alta como Producto real.
  pendingName?: string;
  onPendingNameChange?: (nombre: string) => void;
}) {
  // `null` = no se está editando: se muestra el nombre calculado a partir de `value`.
  // Distinto de null = lo que el usuario está tipeando ahora mismo. Nada de useEffect
  // para "sincronizar" esto con `value` -- el texto mostrado se deriva directo en el
  // render, así no hay drift ni un efecto disparando un segundo render de más.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);

  const productoActual = productos.find((p) => p.id === value);
  const displayValue = typedQuery ?? (productoActual ? `${productoActual.nombre} (${productoActual.sku})` : pendingName ?? "");

  const filtrados = useMemo(() => {
    const termino = (typedQuery ?? "").trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(termino) || p.sku.toLowerCase().includes(termino)
    );
  }, [productos, typedQuery]);

  function seleccionar(producto: Producto) {
    onSelect(producto.id);
    setTypedQuery(null);
    setAbierto(false);
  }

  return (
    <div className={styles.box}>
      <input
        className={styles.input}
        placeholder={placeholder}
        value={displayValue}
        disabled={disabled}
        onChange={(e) => {
          setTypedQuery(e.target.value);
          onSelect("");
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() =>
          setTimeout(() => {
            setAbierto(false);
            // Lo tipeado se guarda como nombre pendiente al salir del campo -antes se
            // descartaba acá mismo si no coincidía con ningún producto del catálogo, y
            // cualquier corrección manual (ej. sacar una letra de más) desaparecía sola.
            if (typedQuery !== null) onPendingNameChange?.(typedQuery.trim());
            setTypedQuery(null);
          }, 150)
        }
      />
      {abierto && (
        <div className={styles.dropdown}>
          {filtrados.length > 0 ? (
            filtrados.map((p) => (
              <div key={p.id} className={styles.option} onMouseDown={() => seleccionar(p)}>
                {p.nombre} ({p.sku})
              </div>
            ))
          ) : (
            <div className={styles.empty}>Sin resultados.</div>
          )}
        </div>
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
