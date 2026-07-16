"use client";

import { useState } from "react";
import { ETAPA_LABEL } from "./OportunidadForm";
import type { EtapaOportunidad, Oportunidad } from "../types";
import styles from "./OportunidadKanban.module.css";

const ETAPAS: EtapaOportunidad[] = ["nuevo", "calificado", "propuesta", "ganado", "perdido"];

export function OportunidadKanban({
  oportunidades,
  onCardClick,
  onEtapaChange,
}: {
  oportunidades: Oportunidad[];
  onCardClick: (oportunidad: Oportunidad) => void;
  onEtapaChange: (oportunidad: Oportunidad, nuevaEtapa: EtapaOportunidad) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overEtapa, setOverEtapa] = useState<EtapaOportunidad | null>(null);

  function handleDrop(etapa: EtapaOportunidad) {
    setOverEtapa(null);
    if (!draggingId) return;
    const oportunidad = oportunidades.find((o) => o.id === draggingId);
    if (oportunidad && oportunidad.etapa !== etapa) {
      onEtapaChange(oportunidad, etapa);
    }
  }

  return (
    <div className={styles.board}>
      {ETAPAS.map((etapa) => {
        const items = oportunidades.filter((o) => o.etapa === etapa);
        const total = items.reduce((sum, o) => sum + Number(o.monto_estimado), 0);

        return (
          <div
            key={etapa}
            className={styles.column}
            data-over={overEtapa === etapa ? "" : undefined}
            onDragOver={(e) => {
              e.preventDefault();
              setOverEtapa(etapa);
            }}
            onDragLeave={() => setOverEtapa((prev) => (prev === etapa ? null : prev))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(etapa);
            }}
          >
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{ETAPA_LABEL[etapa]}</span>
              <span className={styles.columnCount}>{items.length}</span>
            </div>
            <div className={styles.columnTotal}>{total.toFixed(2)}</div>
            <div className={styles.cards}>
              {items.map((oportunidad) => (
                <div
                  key={oportunidad.id}
                  className={styles.card}
                  draggable
                  data-dragging={draggingId === oportunidad.id ? "" : undefined}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", oportunidad.id);
                    setDraggingId(oportunidad.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => onCardClick(oportunidad)}
                >
                  <p className={styles.cardTitulo}>{oportunidad.titulo}</p>
                  <p className={styles.cardContacto}>{oportunidad.contacto_nombre}</p>
                  <p className={styles.cardMonto}>{Number(oportunidad.monto_estimado).toFixed(2)}</p>
                </div>
              ))}
              {items.length === 0 && <p className={styles.emptyCol}>Sin oportunidades</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
