import React from "react";
import styles from "./WidgetCard.module.css";
import type { LucideIcon } from "lucide-react";

interface WidgetCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function WidgetCard({ title, icon: Icon, children, headerAction, className = "", style }: WidgetCardProps) {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {Icon && <Icon size={16} className={styles.icon} />}
          <span>{title}</span>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
