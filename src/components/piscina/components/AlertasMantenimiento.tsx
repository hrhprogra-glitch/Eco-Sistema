import { AlertTriangle, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { EventoCalendario } from "@/components/calendario/types";
import { esEventoProximo, esEventoVencido } from "../alertas";
import styles from "./AlertasMantenimiento.module.css";

export function AlertasMantenimiento({ eventos }: { eventos: EventoCalendario[] }) {
  const eventosDePiscinas = eventos.filter((evento) => evento.piscina_id !== null);
  const vencidos = eventosDePiscinas.filter(esEventoVencido);
  const proximos = eventosDePiscinas.filter(
    (evento) => esEventoProximo(evento) && !esEventoVencido(evento)
  );

  const sinAlertas = vencidos.length === 0 && proximos.length === 0;

  if (sinAlertas) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin alertas por ahora"
        description="Cuando haya mantenimientos vencidos o próximos, van a aparecer acá."
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
    </div>
  );
}
