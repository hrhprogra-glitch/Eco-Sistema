import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import logo from "@/app/imagenes/logo.png";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

const HIGHLIGHTS = [
  "Ventas, facturación y contabilidad en un solo panel",
  "Todo tu equipo trabajando con la misma información",
  "100% local: tus datos no salen de tu empresa",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Image src={logo} alt="Eco-Sistema" className={styles.brandLogo} priority />
          <h1 className={styles.brandTitle}>Eco-Sistema</h1>
          <p className={styles.brandSubtitle}>
            El sistema de gestión que unifica las áreas de tu empresa en un solo lugar.
          </p>
          <ul className={styles.brandList}>
            {HIGHLIGHTS.map((item) => (
              <li key={item} className={styles.brandListItem}>
                <CheckCircle2 size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.formPanel}>
        <LoginForm next={next && next.startsWith("/") && next !== "/" ? next : "/empresa"} />
      </section>
    </div>
  );
}
