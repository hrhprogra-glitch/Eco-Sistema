import styles from "./GraficosHeader.module.css";

export function GraficosHeader({ title }: { title: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>
        Datos de ejemplo — se van a reemplazar cuando el área tenga datos reales conectados.
      </p>
    </header>
  );
}
