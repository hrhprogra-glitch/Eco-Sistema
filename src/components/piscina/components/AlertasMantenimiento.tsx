import { AlertTriangle, CalendarClock, Droplet, Wallet } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { EventoCalendario } from "@/components/calendario/types";
import type { Piscina, PiscinaPago } from "../types";
import {
  esEventoProximo,
  esEventoVencido,
  esPagoProximo,
  esPagoVencido,
  tieneAlertaCloro,
} from "../alertas";
import styles from "./AlertasMantenimiento.module.css";

export function AlertasMantenimiento({
  eventos,
  piscinas,
  pagos,
}: {
  eventos: EventoCalendario[];
  piscinas: Piscina[];
  pagos: PiscinaPago[];
}) {
  const eventosDePiscinas = eventos.filter((evento) => evento.piscina_id !== null);
  const vencidos = eventosDePiscinas.filter(esEventoVencido);
  const proximos = eventosDePiscinas.filter(
    (evento) => esEventoProximo(evento) && !esEventoVencido(evento)
  );
  const cloroAlertas = piscinas.filter(tieneAlertaCloro);
  const pagosVencidos = pagos.filter(esPagoVencido);
  const pagosProximos = pagos.filter((p) => esPagoProximo(p) && !esPagoVencido(p));

  const sinAlertas =
    vencidos.length === 0 &&
    proximos.length === 0 &&
    cloroAlertas.length === 0 &&
    pagosVencidos.length === 0 &&
    pagosProximos.length === 0;

  if (sinAlertas) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin alertas por ahora"
        description="Cuando haya mantenimientos vencidos, próximos, pagos pendientes o niveles de cloro fuera de rango, van a aparecer acá."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      {pagosVencidos.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Wallet size={15} /> Pagos vencidos
          </h3>
          <div className={styles.list}>
            {pagosVencidos.map((pago) => (
              <div key={pago.id} className={`${styles.item} ${styles.danger}`}>
                <span className={styles.itemTitle}>
                  {pago.piscina_nombre} — {pago.contacto_nombre}: S/ {pago.monto.toFixed(2)}
                </span>
                <span className={styles.itemDate}>
                  Vencía el {new Date(`${pago.periodo_fin.slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagosProximos.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Wallet size={15} /> Pagos próximos a vencer
          </h3>
          <div className={styles.list}>
            {pagosProximos.map((pago) => (
              <div key={pago.id} className={`${styles.item} ${styles.warning}`}>
                <span className={styles.itemTitle}>
                  {pago.piscina_nombre} — {pago.contacto_nombre}: S/ {pago.monto.toFixed(2)}
                </span>
                <span className={styles.itemDate}>
                  Vence el {new Date(`${pago.periodo_fin.slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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
