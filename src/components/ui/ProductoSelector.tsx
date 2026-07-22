"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  // Índice resaltado dentro de `filtrados` para navegar con las flechas -sin esto cada
  // tecla de flecha no tenía ningún efecto y había que usar el mouse para todo. Se
  // "clampea" contra el largo actual de `filtrados` en vez de resetearse con un
  // useEffect: así nunca apunta a un índice que ya no existe tras tipear una letra más,
  // sin el render en cascada que dispara un setState dentro de un efecto.
  const [resaltadoRaw, setResaltadoRaw] = useState(0);

  const productoActual = productos.find((p) => p.id === value);
  const displayValue = typedQuery ?? (productoActual ? `${productoActual.nombre} (${productoActual.sku})` : pendingName ?? "");

  const filtrados = useMemo(() => {
    const termino = (typedQuery ?? "").trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(termino) || p.sku.toLowerCase().includes(termino)
    );
  }, [productos, typedQuery]);

  const resaltado = Math.min(resaltadoRaw, Math.max(filtrados.length - 1, 0));

  // El desplegable tiene scroll propio (max-height + overflow-y) y no sigue solo al
  // resaltado: sin esto, al bajar con la flecha más allá de lo que entra en pantalla el
  // ítem activo queda tapado fuera del área visible y parece que la tecla no hizo nada.
  const activaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    activaRef.current?.scrollIntoView({ block: "nearest" });
  }, [resaltado, abierto]);

  function seleccionar(producto: Producto) {
    onSelect(producto.id);
    setTypedQuery(null);
    setAbierto(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setResaltadoRaw(0);
        setAbierto(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltadoRaw(Math.min(resaltado + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltadoRaw(Math.max(resaltado - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const producto = filtrados[resaltado];
      if (producto) seleccionar(producto);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setAbierto(false);
    }
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
          setResaltadoRaw(0);
          onSelect("");
          setAbierto(true);
        }}
        onFocus={() => {
          setResaltadoRaw(0);
          setAbierto(true);
        }}
        onKeyDown={onKeyDown}
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
            filtrados.map((p, i) => (
              <div
                key={p.id}
                ref={i === resaltado ? activaRef : undefined}
                className={i === resaltado ? `${styles.option} ${styles.optionActiva}` : styles.option}
                onMouseEnter={() => setResaltadoRaw(i)}
                onMouseDown={() => seleccionar(p)}
              >
                {p.nombre}
                <span className={styles.optionSku}>({p.sku})</span>
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
