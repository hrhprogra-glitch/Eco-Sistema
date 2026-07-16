import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/sidebar/SidebarProvider";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/Topbar";
import styles from "./layout.module.css";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.mainColumn}>
          <Topbar />
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
