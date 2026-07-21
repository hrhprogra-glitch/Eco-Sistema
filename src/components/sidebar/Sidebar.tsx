"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/app/imagenes/logo.png";
import { appGroups } from "@/components/lib/apps";
import { useSidebar } from "./SidebarProvider";
import styles from "./Sidebar.module.css";

const SIDEBAR_SECTIONS: { label: string; slugs: string[] }[] = [
  { label: "Resumen", slugs: ["resumen"] },
  { label: "Comercial", slugs: ["contacto", "cotizaciones", "calendario"] },
  { label: "Inventario", slugs: ["salidas", "compras", "stock", "activos"] },
  { label: "General", slugs: ["administracion", "piscina"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, position } = useSidebar();
  const activeGroupSlug = pathname.split("/")[1] || null;
  const ChevronIcon = position === "right" ? ChevronRight : ChevronLeft;
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (collapsed) return;

    // Al abrir el menú (Ctrl+A), enfocar el primer elemento interactivo
    setTimeout(() => {
      const focusable = asideRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        // En el sidebar, el primer elemento es el toggle, así que lo omitimos
        // o lo enfocamos. En este caso el toggle es útil para cerrarlo.
        focusable[0].focus();
      }
    }, 10);

    function handlePanelKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const nodes = asideRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        
        const focusableElements = Array.from(nodes);
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        e.preventDefault(); // prevenir scroll
        
        if (e.key === "ArrowDown") {
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        } else {
          const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[nextIndex].focus();
        }
      }
    }

    document.addEventListener("keydown", handlePanelKeyDown);
    return () => document.removeEventListener("keydown", handlePanelKeyDown);
  }, [collapsed]);

  return (
    <aside
      ref={asideRef}
      className={styles.rail}
      data-position={position}
      data-collapsed={collapsed ? "" : undefined}
    >
      <div className={styles.header}>
        <button
          type="button"
          onClick={toggle}
          className={styles.headerToggle}
          aria-label="Mostrar u ocultar el menú"
          title="Mostrar u ocultar el menú"
        >
          <span className={styles.logoWrap}>
            <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
          </span>
          {!collapsed && (
            <>
              <span className={styles.brandName}>Eco-Sistema</span>
              <ChevronIcon size={16} className={styles.chevron} />
            </>
          )}
        </button>
      </div>

      <nav className={styles.nav}>
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.label} className={styles.section}>
            {!collapsed && <div className={styles.navLabel}>{section.label}</div>}
            {section.slugs.map((slug) => {
              const group = appGroups.find((g) => g.slug === slug);
              if (!group) return null;
              const Icon = group.icon;
              const isGroupActive = group.slug === activeGroupSlug;

              return (
                <div key={group.slug}>
                  <Link
                    href={`/${group.slug}`}
                    className={styles.item}
                    data-active={isGroupActive ? "" : undefined}
                    title={group.name}
                    style={{ "--module-accent": group.color } as CSSProperties}
                  >
                    <span className={styles.iconWrap}>
                      <Icon size={20} />
                    </span>
                    {!collapsed && <span>{group.name}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
