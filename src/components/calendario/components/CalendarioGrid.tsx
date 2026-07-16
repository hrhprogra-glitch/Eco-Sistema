"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EstadoEvento, EventoCalendario } from "../types";
import styles from "./CalendarioGrid.module.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ESTADO_COLOR: Record<EstadoEvento, string> = {
  pendiente: "var(--status-pending)",
  completado: "var(--status-online)",
  seguimiento: "var(--status-error)",
  cancelado: "var(--status-offline)",
};

const ESTADO_LABEL: Record<EstadoEvento, string> = {
  pendiente: "Próximo",
  completado: "Hecho",
  seguimiento: "Necesita volver",
  cancelado: "Cancelado",
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // semana empieza en lunes
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function CalendarioGrid({
  eventos,
  onDayClick,
  onEventoClick,
}: {
  eventos: EventoCalendario[];
  onDayClick: (fecha: string) => void;
  onEventoClick: (evento: EventoCalendario) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const hoy = dateKey(new Date());
  const dias = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoCalendario[]>();
    for (const evento of eventos) {
      const key = evento.fecha?.slice(0, 10);
      if (!key) continue;
      const lista = map.get(key) ?? [];
      lista.push(evento);
      map.set(key, lista);
    }
    return map;
  }, [eventos]);

  const monthLabel = cursor.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            className={styles.todayButton}
            onClick={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            Hoy
          </button>
        </div>

        <div className={styles.legend}>
          {(Object.keys(ESTADO_LABEL) as EstadoEvento[]).map((estado) => (
            <span key={estado} className={styles.legendItem} style={{ color: ESTADO_COLOR[estado] }}>
              <span className={styles.legendDot} />
              {ESTADO_LABEL[estado]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.weekdaysRow}>
        {WEEKDAYS.map((dia) => (
          <div key={dia} className={styles.weekday}>
            {dia}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {dias.map((dia) => {
          const key = dateKey(dia);
          const esDelMes = dia.getMonth() === cursor.getMonth();
          const eventosDelDia = eventosPorDia.get(key) ?? [];

          return (
            <div
              key={key}
              className={esDelMes ? styles.cell : `${styles.cell} ${styles.cellOutside}`}
              onClick={() => onDayClick(key)}
            >
              <span className={key === hoy ? styles.dayNumberToday : styles.dayNumber}>{dia.getDate()}</span>
              {eventosDelDia.map((evento) => (
                <button
                  key={evento.id}
                  type="button"
                  className={styles.chip}
                  style={{ background: ESTADO_COLOR[evento.estado] }}
                  title={evento.titulo}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventoClick(evento);
                  }}
                >
                  {evento.titulo}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
