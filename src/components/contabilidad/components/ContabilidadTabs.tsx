import styles from "./ContabilidadTabs.module.css";
import type { ContabilidadVista } from "../types";

const TABS: { key: ContabilidadVista; label: string }[] = [
  { key: "resumen", label: "Resumen" },
  { key: "diario", label: "Libro Diario" },
  { key: "mayor", label: "Libro Mayor" },
  { key: "balance", label: "Balance de Comprobación" },
  { key: "plan_cuentas", label: "Plan de Cuentas" },
];

export function ContabilidadTabs({
  vista,
  onChange,
}: {
  vista: ContabilidadVista;
  onChange: (vista: ContabilidadVista) => void;
}) {
  return (
    <div className={styles.tabs}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`${styles.tab} ${vista === tab.key ? styles.tabActive : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
