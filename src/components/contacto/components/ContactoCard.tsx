import { Mail, Phone } from "lucide-react";
import type { Contacto } from "../types";
import styles from "./ContactoCard.module.css";

const TIPO_LABEL: Record<Contacto["tipo"], string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  otro: "Otro",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ContactoCard({
  contacto,
  onEdit,
}: {
  contacto: Contacto;
  onEdit: (contacto: Contacto) => void;
}) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onEdit(contacto)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(contacto);
        }
      }}
    >
      <div className={styles.header}>
        <span className={styles.avatar}>{iniciales(contacto.nombre)}</span>
        <span className={`${styles.badge} ${styles[contacto.tipo]}`}>
          {TIPO_LABEL[contacto.tipo]}
        </span>
      </div>

      <h3 className={styles.name}>{contacto.nombre}</h3>

      <div className={styles.detail}>
        <Mail size={14} />
        <span>{contacto.email}</span>
      </div>
      <div className={styles.detail}>
        <Phone size={14} />
        <span>{contacto.telefono}</span>
      </div>
    </article>
  );
}
