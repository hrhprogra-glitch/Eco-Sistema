import { AlertTriangle, CalendarClock, Droplet } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { EventoCalendario } from "@/components/calendario/types";
import type { Piscina } from "../types";
import { esEventoProximo, esEventoVencido, tieneAlertaCloro } from "../alertas";
import styles from "./AlertasMantenimiento.module.css";

export function AlertasMantenimiento({
  eventos,
  piscinas,
}: {
  eventos: EventoCalendario[];
  piscinas: Piscina[];
}) {
  const eventosDePiscinas = eventos.filter((evento) => evento.piscina_id !== null);
  const vencidos = eventosDePiscinas.filter(esEventoVencido);
  const proximos = eventosDePiscinas.filter(
    (evento) => esEventoProximo(evento) && !esEventoVencido(evento)
  );
  const cloroAlertas = piscinas.filter(tieneAlertaCloro);

  const sinAlertas = vencidos.length === 0 && proximos.length === 0 && cloroAlertas.length === 0;

  if (sinAlertas) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin alertas por ahora"
        description="Cuando haya mantenimientos vencidos, próximos o niveles de cloro fuera de rango, van a aparecer acá."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      {vencidos.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <AlertTriangle size={15} /> Mantenimientos vencidos
          </h3>
          <div className={styles.list}>
            {vencidos.map((evento) => (
              <div key={evento.id} className={`${styles.item} ${styles.danger}`}>
                <span className={styles.itemTitle}>
                  {evento.piscina_nombre} — {evento.contacto_nombre}: {evento.titulo}
                </span>
                <span className={styles.itemDate}>
                  {new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-PE")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {proximos.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <CalendarClock size={15} /> Próximos (3 días)
          </h3>
          <div className={styles.list}>
            {proximos.map((evento) => (
              <div key={evento.id} className={`${styles.item} ${styles.warning}`}>
                <span className={styles.itemTitle}>
                  {evento.piscina_nombre} — {evento.contacto_nombre}: {evento.titulo}
                </span>
                <span className={styles.itemDate}>
                  {new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-PE")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {cloroAlertas.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Droplet size={15} /> Nivel de cloro fuera de rango
          </h3>
          <div className={styles.list}>
            {cloroAlertas.map((piscina) => (
              <div key={piscina.id} className={`${styles.item} ${styles.danger}`}>
                <span className={styles.itemTitle}>
                  {piscina.nombre || "Piscina"} — {piscina.contacto_nombre}
                </span>
                <span className={styles.itemDate}>{piscina.nivel_cloro} ppm</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
