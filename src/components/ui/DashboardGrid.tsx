import React from "react";
import styles from "./DashboardGrid.module.css";

interface DashboardGridProps {
  children: React.ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className={styles.grid}>
      {children}
    </div>
  );
}

// Export some helper classnames if needed for grid items
export { styles as dashboardStyles };
