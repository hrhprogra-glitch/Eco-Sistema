"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventoCalendario } from "../types";
import styles from "./CalendarioGrid.module.css";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function shiftMonth(cursor: { year: number; month: number }, delta: number) {
  const date = new Date(cursor.year, cursor.month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function CalendarioGrid({
  eventos,
  selectedDate,
  onSelectDay,
}: {
  eventos: EventoCalendario[];
  selectedDate: string | null;
  onSelectDay: (iso: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, EventoCalendario[]>();
    for (const evento of eventos) {
      const list = map.get(evento.fecha) ?? [];
      list.push(evento);
      map.set(evento.fecha, list);
    }
    return map;
  }, [eventos]);

  const todayISO = toISODate(today);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.monthLabel}>
          {MESES[cursor.month]} {cursor.year}
        </h3>
        <div className={styles.nav}>
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, -1))}
            className={styles.navButton}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
            className={styles.todayButton}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, 1))}
            className={styles.navButton}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={styles.weekdays}>
        {DIAS.map((dia) => (
          <span key={dia} className={styles.weekday}>
            {dia}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={styles.emptyCell} />;
          }
          const iso = toISODate(date);
          const eventosDelDia = byDate.get(iso) ?? [];
          const isToday = iso === todayISO;
          const isSelected = iso === selectedDate;

          return (
            <button
              type="button"
              key={iso}
              onClick={() => onSelectDay(iso)}
              className={`${styles.cell} ${isToday ? styles.today : ""} ${
                isSelected ? styles.selected : ""
              }`}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>
              <div className={styles.events}>
                {eventosDelDia.slice(0, 3).map((evento) => (
                  <span key={evento.id} className={`${styles.eventChip} ${styles[evento.estado]}`}>
                    {evento.piscina_nombre || evento.proyecto_nombre || evento.titulo}
                  </span>
                ))}
                {eventosDelDia.length > 3 && (
                  <span className={styles.moreChip}>+{eventosDelDia.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
