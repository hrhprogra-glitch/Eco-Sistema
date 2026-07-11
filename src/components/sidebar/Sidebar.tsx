"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/app/imagenes/logo.png";
import { appGroups } from "@/components/lib/apps";
import { useEmpresa } from "@/components/empresa/EmpresaProvider";
import { useSidebar } from "./SidebarProvider";
import styles from "./Sidebar.module.css";

const SIDEBAR_SECTIONS: { label: string; slugs: string[] }[] = [
  { label: "Ingresos", slugs: ["comercial", "finanzas"] },
  { label: "Recursos", slugs: ["inventario", "activos"] },
  { label: "Operación", slugs: ["recursos-humanos", "operaciones"] },
  { label: "Gestión", slugs: ["analitica", "administracion"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, position } = useSidebar();
  const { nombre: nombreEmpresa } = useEmpresa();
  const activeGroupSlug = pathname.split("/")[1] || null;

  return (
    <aside
      className={styles.rail}
      data-position={position}
      data-collapsed={collapsed ? "" : undefined}
    >
      <div className={styles.header}>
        <button
          type="button"
          onClick={toggle}
          className={styles.logoButton}
          aria-label="Mostrar u ocultar el menú"
          title="Mostrar u ocultar el menú"
        >
          <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
        </button>
        {!collapsed && nombreEmpresa && (
          <span className={styles.empresaLabel} title={nombreEmpresa}>
            {nombreEmpresa}
          </span>
        )}
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
                  >
                    <Icon size={20} />
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
