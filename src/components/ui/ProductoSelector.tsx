"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Producto } from "@/components/inventario/types";
import styles from "./ProductoSelector.module.css";

// Sin esto, tipear "valvula" (sin tilde, como se escribe la mayoría de las veces al
// buscar rápido) no encontraba "VÁLVULA..." ni en la lista ni en el fantasma -el
// catálogo real tiene un montón de nombres con tilde (VÁLVULA, UNIÓN, ELECTROVÁLVULA,
// etc.) y la comparación en texto plano es sensible a acentos.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

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
  sugerenciaVacio,
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
  onPendingNameChange?: (nombre: string, codigo?: string | null) => void;
  // Nombre/código tal como figura en una factura importada, para el AUTOCOMPLETADO
  // FANTASMA: mientras el campo está vacío (sin producto elegido, sin nombre pendiente,
  // sin tipear nada todavía) se muestra en gris adelante del cursor y Tab lo acepta como
  // candidato a producto nuevo. Apenas el usuario escribe algo, este fantasma desaparece
  // y pasa a sugerir productos del catálogo en su lugar (ver `filtrados`).
  sugerenciaVacio?: { nombre: string; codigo: string | null } | null;
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
    const termino = normalizar((typedQuery ?? "").trim());
    if (!termino) return productos;
    return productos.filter(
      (p) => normalizar(p.nombre).includes(termino) || normalizar(p.sku).includes(termino)
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

  // Sugerencia fantasma (gris, adelante del cursor, Tab la acepta): de dónde sale
  // depende de si el usuario ya empezó a escribir o no.
  // - Campo intacto (nunca se tipeó nada, sin producto ni nombre pendiente): la
  //   sugerencia es el nombre tal cual venía en la factura importada -aceptarla con Tab
  //   NO selecciona ningún producto del catálogo, solo carga el nombre como pendiente.
  // - Apenas se tipea algo: la sugerencia pasa a ser el primer producto del catálogo
  //   cuyo nombre empieza con lo tipeado -aceptarla con Tab sí selecciona ese producto.
  let ghostRemanente = "";
  let aceptarGhost: (() => void) | null = null;
  if (abierto && !disabled) {
    if (typedQuery === null) {
      if (!value && !pendingName && sugerenciaVacio?.nombre) {
        ghostRemanente = sugerenciaVacio.nombre;
        const sugerencia = sugerenciaVacio;
        aceptarGhost = () => {
          onPendingNameChange?.(sugerencia.nombre, sugerencia.codigo);
          setAbierto(false);
        };
      }
    } else if (typedQuery.length > 0) {
      const terminoNorm = normalizar(typedQuery);
      const match = productos.find((p) => normalizar(p.nombre).startsWith(terminoNorm));
      if (match && match.nombre.length > typedQuery.length) {
        ghostRemanente = match.nombre.slice(typedQuery.length);
        aceptarGhost = () => seleccionar(match);
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab" && aceptarGhost) {
      e.preventDefault();
      aceptarGhost();
      return;
    }
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
      <div className={styles.inputWrap}>
        {ghostRemanente && (
          <div className={styles.ghost} aria-hidden="true">
            <span className={styles.ghostTyped}>{typedQuery ?? ""}</span>
            <span className={styles.ghostSuggestion}>{ghostRemanente}</span>
          </div>
        )}
        <input
          className={styles.input}
          // Si hay una sugerencia de factura y el campo está vacío, el fondo ya muestra
          // el nombre tal cual vino en el comprobante -sin hacer falta clic ni foco
          // primero, como un placeholder normal- en vez del texto genérico "Buscar
          // producto…". El overlay fantasma (ghost) de más abajo toma la posta apenas se
          // enfoca el campo, para poder aceptarlo con Tab.
          placeholder={sugerenciaVacio?.nombre || placeholder}
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
      </div>
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
