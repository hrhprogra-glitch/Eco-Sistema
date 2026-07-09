import { MapPin, Repeat } from "lucide-react";
import type { Piscina } from "../types";
import styles from "./PiscinaCard.module.css";

const ESTADO_LABEL: Record<Piscina["estado"], string> = {
  operativa: "Operativa",
  mantenimiento: "En mantenimiento",
  cerrada: "Cerrada",
};

const FRECUENCIA_LABEL: Record<Piscina["frecuencia"], string> = {
  semanal: "Semanal",
  quincenal: "Quincenal",
};

export function PiscinaCard({
  piscina,
  onClick,
}: {
  piscina: Piscina;
  onClick: () => void;
}) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[piscina.estado]}`}>
          {ESTADO_LABEL[piscina.estado]}
        </span>
      </div>

      <h3 className={styles.name}>{piscina.nombre || "Piscina sin nombre"}</h3>
      <p className={styles.contacto}>{piscina.contacto_nombre}</p>

      {piscina.ubicacion && (
        <a
          href={piscina.ubicacion}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={styles.mapLink}
        >
          <MapPin size={12} /> Ver ubicación
        </a>
      )}

      <p className={styles.detail}>
        <Repeat size={12} /> {FRECUENCIA_LABEL[piscina.frecuencia]} · S/{" "}
        {Number(piscina.precio_mantenimiento).toFixed(2)}
      </p>
    </article>
  );
}
