import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "cliente" | "proveedor" | "otro";

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span className={styles.badge} data-variant={variant}>
      {children}
    </span>
  );
}
