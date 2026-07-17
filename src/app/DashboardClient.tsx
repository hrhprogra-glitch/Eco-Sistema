import Image from "next/image";
import logo from "@/app/imagenes/logo.png";
import styles from "./DashboardClient.module.css";

export function DashboardClient() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.logoStage}>
        <div className={styles.glowRing} aria-hidden="true" />
        <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
      </div>
    </div>
  );
}
