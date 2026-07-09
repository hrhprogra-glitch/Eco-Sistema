"use client";

import { useEffect, useState } from "react";
import styles from "./SyncStatus.module.css";

type Status = {
  pending: number;
  failed: number;
  isOnline: boolean;
  lastSuccessAt: string | null;
};

const POLL_MS = 10000;

export function SyncStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/sync/status");
        if (!res.ok) return;
        const data = (await res.json()) as Status;
        if (!cancelled) setStatus(data);
      } catch {
        // silencioso: si falla el poll, se reintenta en el proximo tick
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!status) return null;

  let dotClass = styles.dotOffline;
  let label = "Sin conexión";

  if (status.failed > 0) {
    dotClass = styles.dotError;
    label = `${status.failed} sin sincronizar`;
  } else if (!status.isOnline) {
    dotClass = styles.dotOffline;
    label = "Sin conexión";
  } else if (status.pending > 0) {
    dotClass = styles.dotPending;
    label = `Pendiente (${status.pending})`;
  } else {
    dotClass = styles.dotOnline;
    label = "Sincronizado";
  }

  return (
    <div className={styles.wrapper} title={label}>
      <span className={`${styles.dot} ${dotClass}`} />
      <span>{label}</span>
    </div>
  );
}
