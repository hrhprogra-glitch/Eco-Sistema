"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Contacto } from "../types";
import { AlphabetFilter } from "./AlphabetFilter";
import { ContactoCard } from "./ContactoCard";
import styles from "./ContactosKanban.module.css";

export function ContactosKanban({
  contactos,
  onNuevo,
  onEditar,
}: {
  contactos: Contacto[];
  onNuevo: () => void;
  onEditar: (contacto: Contacto) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    for (const contacto of contactos) {
      const inicial = contacto.nombre.trim().charAt(0).toUpperCase();
      if (inicial) set.add(inicial);
    }
    return set;
  }, [contactos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contactos.filter((contacto) => {
      const matchesQuery =
        !q ||
        contacto.nombre.toLowerCase().includes(q) ||
        contacto.email.toLowerCase().includes(q) ||
        contacto.telefono.includes(q);
      const matchesLetter =
        !activeLetter || contacto.nombre.trim().toUpperCase().startsWith(activeLetter);
      return matchesQuery && matchesLetter;
    });
  }, [contactos, query, activeLetter]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar contacto..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button type="button" className={styles.newButton} onClick={onNuevo}>
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      <AlphabetFilter
        active={activeLetter}
        available={availableLetters}
        onSelect={setActiveLetter}
      />

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? "contacto" : "contactos"}
      </p>

      <div className={styles.grid}>
        {filtered.map((contacto) => (
          <ContactoCard key={contacto.id} contacto={contacto} onEdit={onEditar} />
        ))}
      </div>
    </div>
  );
}
