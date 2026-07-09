import Image from "next/image";
import Link from "next/link";
import logo from "@/app/imagenes/logo.png";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ZoomControl } from "@/components/zoom/ZoomControl";
import { UserMenu } from "@/components/session/UserMenu";
import { SyncStatus } from "@/components/sync/SyncStatus";
import styles from "./Topbar.module.css";

export function Topbar({
  title,
  icon: Icon,
  showBack = false,
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  showBack?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {showBack && (
          <Link href="/" className={styles.back}>
            ← Inicio
          </Link>
        )}
        <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
        {title && (
          <>
            <span className={styles.divider}>/</span>
            {Icon && <Icon size={18} className={styles.icon} />}
            <span className={styles.title}>{title}</span>
          </>
        )}
        {children && <div className={styles.navLinks}>{children}</div>}
      </div>

      <div className={styles.right}>
        <SyncStatus />
        <div className={styles.separator} />
        <ZoomControl />
        <div className={styles.separator} />
        <ThemeToggle />
        <div className={styles.separator} />
        <UserMenu />
      </div>
    </header>
  );
}
