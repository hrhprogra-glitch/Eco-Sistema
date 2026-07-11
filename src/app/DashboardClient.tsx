import Image from "next/image";
import logo from "@/app/imagenes/logo.png";
import styles from "./DashboardClient.module.css";

export function DashboardClient() {
  return (
    <div className={styles.wrapper}>
      <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
    </div>
  );
}
