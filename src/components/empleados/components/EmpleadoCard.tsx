import { Building2 } from "lucide-react";
import type { Empleado } from "../types";
import styles from "./EmpleadoCard.module.css";

function iniciales(nombre: string) {
  const trimmed = nombre.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function EmpleadoCard({
  empleado,
  onClick,
}: {
  empleado: Empleado;
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
      <div className={styles.photo}>
        {empleado.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={empleado.foto_url} alt={empleado.nombre} className={styles.photoImg} />
        ) : (
          <span className={styles.initials}>{iniciales(empleado.nombre)}</span>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{empleado.nombre}</p>
        <p className={styles.puesto}>{empleado.puesto || "Sin puesto asignado"}</p>
        {empleado.area && (
          <span className={styles.areaBadge}>
            <Building2 size={12} />
            {empleado.area}
          </span>
        )}
      </div>
    </article>
  );
}
