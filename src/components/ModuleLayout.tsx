import type { AppModule } from "@/components/lib/apps";
import { moduleIcons } from "@/components/moduleIcons";
import { Topbar } from "@/components/Topbar";
import styles from "./ModuleLayout.module.css";

export function ModuleLayout({
  app,
  topbarContent,
  children,
}: {
  app: AppModule;
  topbarContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <Topbar title={app.name} icon={moduleIcons[app.slug]} showBack>
        {topbarContent}
      </Topbar>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
