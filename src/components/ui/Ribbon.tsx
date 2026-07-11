import type { LucideIcon } from "lucide-react";
import styles from "./Ribbon.module.css";

export type RibbonButton = {
  key: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
};

export type RibbonGroup = {
  label: string;
  buttons: RibbonButton[];
};

export function Ribbon({ groups }: { groups: RibbonGroup[] }) {
  return (
    <div className={styles.ribbon}>
      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          <div className={styles.buttons}>
            {group.buttons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={button.onClick}
                disabled={button.disabled}
                data-active={button.active ? "" : undefined}
                className={styles.button}
                title={button.label}
              >
                <button.icon size={20} />
                <span className={styles.buttonLabel}>{button.label}</span>
              </button>
            ))}
          </div>
          <span className={styles.groupLabel}>{group.label}</span>
        </div>
      ))}
    </div>
  );
}
