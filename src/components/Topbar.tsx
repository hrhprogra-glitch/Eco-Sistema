"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { appGroups } from "@/components/lib/apps";
import { AlertsMenu } from "@/components/topbar/AlertsMenu";
import { SettingsMenu } from "@/components/topbar/SettingsMenu";
import { UserMenu } from "@/components/session/UserMenu";
import styles from "./Topbar.module.css";

const MAX_SESIONES_VISIBLES = 3;

export function Topbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGroupSlug = pathname.split("/")[1] || null;
  const activeSectionSlug = searchParams.get("s");

  const group = appGroups.find((g) => g.slug === activeGroupSlug);
  const sections = group?.sections.filter((s) => s.implemented).slice(0, MAX_SESIONES_VISIBLES) || [];
  const defaultSectionSlug = sections[0]?.slug ?? group?.sections[0]?.slug;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {group && sections.length > 1 && (
          <nav className={styles.sectionsNav}>
            {sections.map((sec) => {
              const SecIcon = sec.icon;
              const isSectionActive = (activeSectionSlug ?? defaultSectionSlug) === sec.slug;
              return (
                <Link
                  key={sec.slug}
                  href={`/${group.slug}?s=${sec.slug}`}
                  className={styles.sectionTab}
                  data-active={isSectionActive ? "" : undefined}
                >
                  <SecIcon size={16} />
                  <span>{sec.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className={styles.center}>
      </div>

      <div className={styles.right}>
        <AlertsMenu />
        <SettingsMenu />
        <div className={styles.separator} />
        <UserMenu />
      </div>
    </header>
  );
}
