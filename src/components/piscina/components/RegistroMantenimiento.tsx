"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Trash2 } from "lucide-react";
import type { Producto } from "@/components/inventario/types";
import type { PiscinaConsumo, PiscinaConsumoInput } from "../types";
import { SimpleSelect } from "./SimpleSelect";
import styles from "./RegistroMantenimiento.module.css";

const OTRO_VALUE = "otro";

function esMismoMes(fecha: string) {
  const d = new Date(fecha);
  const hoy = new Date();
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth();
}

export function RegistroMantenimiento({
  piscinaId,
  precioMantenimiento,
}: {
  piscinaId: string;
  precioMantenimiento: number;
}) {
  const [registros, setRegistros] = useState<PiscinaConsumo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [productoId, setProductoId] = useState<string>("");
  const [nombreExterno, setNombreExterno] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");

  const cargar = async () => {
    setLoading(true);
    const [registrosRes, productosRes] = await Promise.all([
      fetch(`/api/piscinas/${piscinaId}/consumos`),
      fetch("/api/productos"),
    ]);
    if (registrosRes.ok) setRegistros(await registrosRes.json());
    if (productosRes.ok) setProductos(await productosRes.json());
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, [piscinaId]);

  const visitasDelMes = useMemo(
    () => registros.filter((r) => esMismoMes(r.created_at)).length,
    [registros]
  );
  const totalDelMes = visitasDelMes * precioMantenimiento;

  async function handleAgregar() {
    if (cantidad <= 0) return;
    if (productoId === OTRO_VALUE && !nombreExterno.trim()) return;

    const input: PiscinaConsumoInput = {
      producto_id: productoId && productoId !== OTRO_VALUE ? productoId : null,
      nombre_externo: productoId === OTRO_VALUE ? nombreExterno.trim() : null,
      cantidad,
      notas: notas.trim() || null,
    };

    const res = await fetch(`/api/piscinas/${piscinaId}/consumos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      setProductoId("");
      setNombreExterno("");
      setCantidad(1);
      setNotas("");
      await cargar();
    }
  }

  async function handleEliminar(registro: PiscinaConsumo) {
    if (!window.confirm("¿Quitar este registro? Si venía del inventario, el stock se repone."))
      return;
    const res = await fetch(`/api/piscinas/${piscinaId}/consumos/${registro.id}`, {
      method: "DELETE",
    });
    if (res.ok) await cargar();
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.headerRow}>
        <h3 className={styles.sectionTitle}>
          <ClipboardList size={16} /> Registro de mantenimientos
        </h3>
        <div className={styles.resumenCard}>
          <span className={styles.resumenLabel}>Este mes</span>
          <span className={styles.resumenValor}>
            {visitasDelMes} visita{visitasDelMes === 1 ? "" : "s"}
          </span>
          <span className={styles.resumenSeparador}>·</span>
          <span className={styles.resumenMonto}>S/ {totalDelMes.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.form}>
        <SimpleSelect
          value={productoId}
          placeholder="Qué se usó..."
          options={[
            ...productos.map((producto) => ({
              value: String(producto.id),
              label: `${producto.nombre} (stock: ${producto.stock})`,
            })),
            { value: OTRO_VALUE, label: "Otro (no listado)" },
          ]}
          onChange={setProductoId}
        />

        {productoId === OTRO_VALUE && (
          <input
            type="text"
            value={nombreExterno}
            onChange={(event) => setNombreExterno(event.target.value)}
            placeholder="Nombre del producto"
            className={styles.input}
          />
        )}

        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(event) => setCantidad(Number(event.target.value))}
          className={styles.inputCantidad}
        />

        <input
          type="text"
          value={notas}
          onChange={(event) => setNotas(event.target.value)}
          placeholder="Notas (opcional)"
          className={styles.input}
        />

        <button type="button" onClick={handleAgregar} className={styles.addButton}>
          Registrar
        </button>
      </div>

      <div className={styles.lista}>
        {loading ? (
          <p className={styles.empty}>Cargando registros...</p>
        ) : registros.length === 0 ? (
          <p className={styles.empty}>Todavía no hay registros para esta piscina.</p>
        ) : (
          registros.map((registro) => (
            <div key={registro.id} className={styles.item}>
              <div>
                <p className={styles.itemNombre}>
                  {registro.producto_nombre || registro.nombre_externo} × {registro.cantidad}
                </p>
                <p className={styles.itemFecha}>
                  {new Date(registro.created_at).toLocaleDateString("es-PE")}
                  {registro.notas ? ` · ${registro.notas}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleEliminar(registro)}
                className={styles.itemDelete}
                aria-label="Eliminar registro"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
