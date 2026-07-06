import { Image as ImageIcon, Star } from "lucide-react";
import type { Producto } from "../types";
import styles from "./ProductoCard.module.css";

export function ProductoCard({
  producto,
  onClick,
}: {
  producto: Producto;
  onClick: () => void;
}) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.photo}>
        {producto.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.foto_url} alt={producto.nombre} className={styles.photoImg} />
        ) : (
          <ImageIcon size={26} className={styles.photoPlaceholder} />
        )}
        {producto.favorito && <Star size={14} className={styles.favIcon} fill="currentColor" />}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{producto.nombre}</p>
        <p className={styles.code}>[{producto.sku}]</p>
        <p className={styles.price}>Precio: S/ {producto.precio.toFixed(2)}</p>
        {producto.rastrear_inventario && (
          <p className={styles.stock}>Stock: {producto.stock}</p>
        )}
      </div>
    </article>
  );
}
