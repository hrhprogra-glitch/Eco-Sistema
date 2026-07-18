"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/app/imagenes/logo.png";
import styles from "./DashboardClient.module.css";

export function DashboardClient() {
  const [entering, setEntering] = useState(true);
  const [hopping, setHopping] = useState(false);
  const hoveringRef = useRef(false);

  useEffect(() => {
    setEntering(true);
  }, []);

  function handleMouseEnter() {
    hoveringRef.current = true;
    setHopping(true);
  }

  function handleMouseLeave() {
    hoveringRef.current = false;
  }

  function handleAnimationIteration() {
    if (!hoveringRef.current) {
      setHopping(false);
    }
  }

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName.includes("logo-entrance")) {
      setEntering(false);
    }
  }

  const stageClassName = [styles.logoStage, entering && styles.entering, hopping && styles.hopping]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div
        className={stageClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onAnimationIteration={handleAnimationIteration}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={styles.glowRing} aria-hidden="true" />
        <Image src={logo} alt="Eco-Sistema" className={styles.logo} priority />
      </div>
    </div>
  );
}
