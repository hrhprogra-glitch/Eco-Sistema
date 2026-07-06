import type { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.css";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.iconCircle}>
        <Icon size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
