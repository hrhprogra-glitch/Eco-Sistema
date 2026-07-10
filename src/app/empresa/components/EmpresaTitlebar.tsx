import styles from "./EmpresaTitlebar.module.css";

export function EmpresaTitlebar() {
  return (
    <div className={styles.titlebar}>
      <span className={styles.appName}>Eco-Sistema</span>
    </div>
  );
}
