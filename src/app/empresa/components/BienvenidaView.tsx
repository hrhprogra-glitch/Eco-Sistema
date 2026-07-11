"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Check, FlaskConical, UploadCloud, type LucideIcon } from "lucide-react";
import { logout } from "@/app/login/actions";
import { crearEmpresa, usarDatosDePrueba } from "../actions";
import { EmpresaTitlebar } from "./EmpresaTitlebar";
import styles from "./BienvenidaView.module.css";

type Opcion = "crear" | "subir" | "prueba";

const OPCIONES: { id: Opcion; icon: LucideIcon; titulo: string; texto: string }[] = [
  {
    id: "crear",
    icon: Building2,
    titulo: "Crear una empresa",
    texto:
      "Con esta opción vas a crear tu primera empresa en la aplicación. Solo te pediremos el nombre y podrás comenzar a trabajar de inmediato.",
  },
  {
    id: "subir",
    icon: UploadCloud,
    titulo: "Subir mis empresas",
    texto: "Sincronizá empresas con las que ya trabajaste en local. Disponible próximamente.",
  },
  {
    id: "prueba",
    icon: FlaskConical,
    titulo: "Utilizar datos de prueba",
    texto: "Usá una empresa de ejemplo para conocer el funcionamiento de la aplicación más rápido.",
  },
];

export function BienvenidaView() {
  const [opcion, setOpcion] = useState<Opcion>("crear");

  return (
    <div className={styles.shell}>
      <EmpresaTitlebar />

      <div className={styles.page}>
        <aside className={styles.rail}>
          <span className={styles.railItem} data-active="">
            Crear una empresa
          </span>
          <form action={logout}>
            <button type="submit" className={styles.railItem}>
              Salir
            </button>
          </form>
        </aside>

        <form action={opcion === "prueba" ? usarDatosDePrueba : crearEmpresa} className={styles.main}>
          <h1 className={styles.title}>Bienvenido a Eco-Sistema</h1>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Selecciona la opción que desees</h2>

            <div className={styles.cards}>
              {OPCIONES.map(({ id, icon: Icon, titulo, texto }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.card}
                  data-selected={opcion === id ? "" : undefined}
                  onClick={() => setOpcion(id)}
                >
                  <span className={styles.cardHeader}>
                    <span className={styles.cardTitleGroup}>
                      <Icon size={18} />
                      <span className={styles.cardTitle}>{titulo}</span>
                    </span>
                    <span className={styles.checkbox}>{opcion === id && <Check size={14} />}</span>
                  </span>
                  <p className={styles.cardText}>{texto}</p>
                </button>
              ))}
            </div>

            {opcion === "crear" && (
              <div className={styles.nombreGroup}>
                <label htmlFor="nombre" className={styles.nombreLabel}>
                  Nombre de la empresa
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  className={styles.nombreInput}
                  placeholder="Mi Empresa"
                  autoFocus
                />
              </div>
            )}
          </section>

          <footer className={styles.footer}>
            <Link href="/empresa?vista=abrir" className={styles.cancelLink}>
              No crear una empresa en este momento
            </Link>

            <button
              type="submit"
              disabled={opcion === "subir"}
              className={styles.nextButton}
              title={opcion === "subir" ? "Disponible próximamente" : undefined}
            >
              Siguiente ›
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
