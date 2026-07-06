import { AlertTriangle, Droplet, MapPin } from "lucide-react";
import type { Piscina } from "../types";
import { tieneAlertaCloro } from "../alertas";
import styles from "./PiscinaCard.module.css";

const ESTADO_LABEL: Record<Piscina["estado"], string> = {
  operativa: "Operativa",
  mantenimiento: "En mantenimiento",
  cerrada: "Cerrada",
};

export function PiscinaCard({
  piscina,
  onClick,
}: {
  piscina: Piscina;
  onClick: () => void;
}) {
  const alertaCloro = tieneAlertaCloro(piscina);

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
        {alertaCloro && (
          <span className={styles.cloroAlert} title="Nivel de cloro fuera de rango">
            <AlertTriangle size={14} />
          </span>
        )}
      </div>

      <h3 className={styles.name}>{piscina.nombre || "Piscina sin nombre"}</h3>
      <p className={styles.contacto}>{piscina.contacto_nombre}</p>

      {piscina.ubicacion && (
        <p className={styles.detail}>
          <MapPin size={12} /> {piscina.ubicacion}
        </p>
      )}

      {piscina.nivel_cloro !== null && (
        <p className={`${styles.detail} ${alertaCloro ? styles.detailAlert : ""}`}>
          <Droplet size={12} /> Cloro: {piscina.nivel_cloro} ppm
        </p>
      )}
    </article>
  );
}
