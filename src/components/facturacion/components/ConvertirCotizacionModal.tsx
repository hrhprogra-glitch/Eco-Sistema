"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Cotizacion } from "@/components/cotizaciones/types";
import type { Factura } from "../types";
import styles from "./ConvertirCotizacionModal.module.css";

export function ConvertirCotizacionModal({
  facturasExistentes,
  onClose,
  onConverted,
}: {
  facturasExistentes: Factura[];
  onClose: () => void;
  onConverted: (factura: Factura) => void;
}) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [convirtiendoId, setConvirtiendoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cotizaciones")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCotizaciones)
      .catch(() => setCotizaciones([]))
      .finally(() => setLoading(false));
  }, []);

  const yaConvertidas = useMemo(
    () => new Set(facturasExistentes.map((f) => f.cotizacion_id).filter(Boolean)),
    [facturasExistentes]
  );

  const disponibles = cotizaciones.filter((c) => c.estado === "aceptada" && !yaConvertidas.has(c.id));

  async function handleConvertir(cotizacion: Cotizacion) {
    setConvirtiendoId(cotizacion.id);
    setError(null);
    try {
      const res = await fetch("/api/facturas/convertir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cotizacion_id: cotizacion.id }),
      });
      if (!res.ok) throw new Error("No se pudo convertir la cotización.");
      const factura = await res.json();
      onConverted(factura);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setConvirtiendoId(null);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <p className={styles.title}>Convertir cotización en factura</p>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {error && <p className={fieldStyles.errorBanner}>{error}</p>}

        <div className={styles.list}>
          {loading ? (
            <p className={styles.empty}>Cargando…</p>
          ) : disponibles.length > 0 ? (
            disponibles.map((cotizacion) => (
              <button
                key={cotizacion.id}
                type="button"
                className={styles.item}
                disabled={convirtiendoId !== null}
                onClick={() => handleConvertir(cotizacion)}
              >
                <span className={styles.itemTitle}>
                  #{cotizacion.numero} — {cotizacion.contacto_nombre ?? "Sin cliente"}
                </span>
                <span className={styles.itemMeta}>
                  Total {Number(cotizacion.total).toFixed(2)} · {cotizacion.fecha?.slice(0, 10)}
                  {convirtiendoId === cotizacion.id ? " · Convirtiendo…" : ""}
                </span>
              </button>
            ))
          ) : (
            <p className={styles.empty}>No hay cotizaciones aceptadas pendientes de convertir.</p>
          )}
        </div>
      </div>
    </div>
  );
}
