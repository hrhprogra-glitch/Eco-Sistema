"use client";

import { useEffect, useState } from "react";
import styles from "./TopbarClock.module.css";

export function TopbarClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className={styles.clock}>
      <span className={styles.time}>{time}</span>
      <span className={styles.date}>{date}</span>
    </div>
  );
}
