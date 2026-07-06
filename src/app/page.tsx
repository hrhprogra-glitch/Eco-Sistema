import { Topbar } from "@/components/Topbar";
import { getSession } from "@/lib/auth";
import styles from "./page.module.css";
import { AppsClient } from "./AppsClient";

export default async function Home() {
  const session = await getSession();
  const firstName = session?.username?.split(/[.\s_]/)[0] ?? null;

  return (
    <div className={styles.page}>
      <Topbar />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kicker}>Eco-Sistema · Panel</span>
          <h1 className={styles.title}>{firstName ? `Hola, ${firstName}` : "Panel de aplicaciones"}</h1>
          <p className={styles.subtitle}>Elegí una aplicación para comenzar</p>
        </header>

        <AppsClient />
      </div>
    </div>
  );
}
