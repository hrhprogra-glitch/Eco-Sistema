"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import styles from "./SearchBox.module.css";

export function SearchBox() {
  const [value, setValue] = useState("");

  return (
    <div className={styles.wrapper}>
      <Search size={15} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar..."
        className={styles.input}
      />
    </div>
  );
}
