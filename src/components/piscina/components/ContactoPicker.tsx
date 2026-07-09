"use client";

import { useMemo, useState } from "react";
import { Search, User, X } from "lucide-react";
import styles from "./ContactoPicker.module.css";

type ContactoOption = { id: number; nombre: string };

export function ContactoPicker({
  contactos,
  selectedId,
  onSelect,
}: {
  contactos: ContactoOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(selectedId === null);

  const selected = contactos.find((c) => c.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return contactos.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 20);
  }, [contactos, query]);

  if (selected && !open) {
    return (
      <div className={styles.selected}>
        <User size={14} />
        <span>{selected.nombre}</span>
        <button type="button" onClick={() => setOpen(true)} className={styles.changeButton}>
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBox}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar contacto..."
          className={styles.searchInput}
          autoFocus
        />
        {selected && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={styles.cancelButton}
            aria-label="Cancelar"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className={styles.list}>
        {query.trim() === "" ? (
          <p className={styles.empty}>Escribí para buscar un contacto...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>Sin resultados. Cargalo primero en Contactos.</p>
        ) : (
          filtered.map((contacto) => (
            <button
              key={contacto.id}
              type="button"
              className={styles.option}
              onClick={() => {
                onSelect(contacto.id);
                setOpen(false);
                setQuery("");
              }}
            >
              <User size={14} />
              {contacto.nombre}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
