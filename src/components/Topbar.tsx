"use client";

import type { CSSProperties } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { appGroups } from "@/components/lib/apps";
import { AlertsMenu } from "@/components/topbar/AlertsMenu";
import { UndoRedoControls } from "@/components/topbar/UndoRedoControls";
import { SettingsMenu } from "@/components/topbar/SettingsMenu";
import { TopbarClock } from "@/components/topbar/TopbarClock";
import { UserMenu } from "@/components/session/UserMenu";
import styles from "./Topbar.module.css";

export function Topbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGroupSlug = pathname.split("/")[1] || null;
  const activeSectionSlug = searchParams.get("s");

  const group = appGroups.find((g) => g.slug === activeGroupSlug);
  const sections = group?.sections || [];
  const defaultSectionSlug = sections[0]?.slug;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {group && (
          <div
            className={styles.moduleBadge}
            style={{ "--module-accent": group.color } as CSSProperties}
          >
            <span className={styles.moduleBadgeIcon}>
              <group.icon size={15} />
            </span>
            <span className={styles.moduleBadgeName}>{group.name}</span>
          </div>
        )}
      </div>

      <div className={styles.center}>
        <TopbarClock />
      </div>

      <div className={styles.right}>
        <UndoRedoControls />
        <AlertsMenu />
        <SettingsMenu />
        <div className={styles.separator} />
        <UserMenu />
      </div>
    </header>
  );
}
