"use client";

import { useMemo, useState } from "react";
import styles from "./NombreBuscador.module.css";

type Opcion = { id: string; nombre: string; subtitulo?: string };

// Campo de texto libre con sugerencias: a diferencia de ProductoSelector, acá el valor
// que viaja al backend es siempre el nombre tipeado (no un id de FK) -- clientes y
// trabajadores en Salidas se guardan como texto dentro del motivo del movimiento, no
// como referencia a contactos/empleados. El buscador solo ayuda a completar rápido con
// un nombre ya existente; si no aparece en la lista, se puede escribir cualquier cosa.
export function NombreBuscador({
  value,
  opciones,
  placeholder,
  onChange,
}: {
  value: string;
  opciones: Opcion[];
  placeholder?: string;
  onChange: (nombre: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  const filtrados = useMemo(() => {
    const termino = value.trim().toLowerCase();
    const base = termino
      ? opciones.filter((o) => o.nombre.toLowerCase().includes(termino))
      : opciones;
    return base.slice(0, 20);
  }, [opciones, value]);

  return (
    <div className={styles.box}>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
      />
      {abierto && filtrados.length > 0 && (
        <div className={styles.dropdown}>
          {filtrados.map((o) => (
            <div
              key={o.id}
              className={styles.option}
              onMouseDown={() => {
                onChange(o.nombre);
                setAbierto(false);
              }}
            >
              {o.nombre}
              {o.subtitulo && <span className={styles.optionSub}>{o.subtitulo}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
