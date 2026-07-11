"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Archive,
  Building2,
  CheckCheck,
  ClipboardList,
  Clock,
  FilePlus2,
  FolderGit2,
  FolderOpen,
  Info,
  Settings,
  ShieldCheck,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { EmptyState } from "@/components/EmptyState";
import { entrarAEmpresa } from "../actions";
import type { EmpresaActual } from "../types";
import styles from "./AbrirView.module.css";

type Seccion = "informacion" | "nuevo" | "abrir" | "cerrar" | "seguridad" | "registro" | "opciones";
type SubVista = "recientes" | "existentes" | "archivo" | "chequeo" | "repositorio";

const SECCIONES: { id: Seccion; icon: LucideIcon; label: string }[] = [
  { id: "informacion", icon: Info, label: "Información" },
  { id: "nuevo", icon: FilePlus2, label: "Nuevo" },
  { id: "abrir", icon: FolderOpen, label: "Abrir" },
  { id: "cerrar", icon: XCircle, label: "Cerrar" },
  { id: "seguridad", icon: ShieldCheck, label: "Seguridad" },
];

const SECCIONES_INFERIORES: { id: Seccion; icon: LucideIcon; label: string }[] = [
  { id: "registro", icon: ClipboardList, label: "Registro" },
  { id: "opciones", icon: Settings, label: "Opciones" },
];

const SUB_VISTAS: { id: SubVista; icon: LucideIcon; label: string }[] = [
  { id: "recientes", icon: Clock, label: "Recientes" },
  { id: "existentes", icon: Building2, label: "Empresas existentes" },
  { id: "archivo", icon: Archive, label: "Archivo de empresas" },
  { id: "chequeo", icon: CheckCheck, label: "Chequeo del archivo de empresas" },
  { id: "repositorio", icon: FolderGit2, label: "Repositorio de archivos" },
];

export function AbrirView({
  empresa,
  username,
}: {
  empresa: EmpresaActual | null;
  username: string | null;
}) {
  const [seccion, setSeccion] = useState<Seccion>("abrir");
  const [subVista, setSubVista] = useState<SubVista>("recientes");

  const todasLasSecciones = SECCIONES.concat(SECCIONES_INFERIORES);
  const subVistaActiva = SUB_VISTAS.find((s) => s.id === subVista)!;

  return (
    <div className={styles.shell}>
      <div className={styles.page}>
        <aside className={styles.rail}>
          <form action={logout}>
            <button type="submit" className={styles.backButton} title="Cerrar sesión">
              <ArrowLeft size={18} />
            </button>
          </form>

          <nav className={styles.nav}>
            {SECCIONES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={styles.navItem}
                data-active={seccion === id ? "" : undefined}
                onClick={() => setSeccion(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <nav className={styles.navBottom}>
            {SECCIONES_INFERIORES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={styles.navItem}
                data-active={seccion === id ? "" : undefined}
                onClick={() => setSeccion(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <div className={styles.userBlock}>
              <span className={styles.userName}>{username ?? "Invitado"}</span>
              <span className={styles.avatarBox}>
                <User size={20} />
              </span>
            </div>
          </header>

          <div className={styles.content}>
            {seccion !== "abrir" ? (
              <EmptyState
                icon={todasLasSecciones.find((s) => s.id === seccion)!.icon}
                title="Disponible próximamente"
              />
            ) : (
              <>
                <h1 className={styles.title}>Abrir</h1>
                <div className={styles.abrirLayout}>
                  <nav className={styles.subNav}>
                    {SUB_VISTAS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        className={styles.subNavItem}
                        data-active={subVista === id ? "" : undefined}
                        onClick={() => setSubVista(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>

                  <div className={styles.subContent}>
                    {subVista !== "recientes" ? (
                      <EmptyState icon={subVistaActiva.icon} title="Disponible próximamente" />
                    ) : empresa ? (
                      <>
                        <h2 className={styles.subTitle}>Recientes</h2>
                        <form action={entrarAEmpresa}>
                          <button type="submit" className={styles.empresaItem}>
                            <Building2 size={20} />
                            <span className={styles.empresaInfo}>
                              <span className={styles.empresaNombre}>{empresa.nombre}</span>
                              <span className={styles.empresaFecha}>
                                Creada el {new Date(empresa.creadaEn).toLocaleDateString()}
                              </span>
                            </span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <EmptyState
                          icon={Clock}
                          title="No hay empresas recientes"
                          description="Todavía no creaste ninguna empresa."
                        />
                        <Link href="/empresa" className={styles.emptyLink}>
                          Crear una empresa
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
