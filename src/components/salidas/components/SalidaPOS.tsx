"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Trash2, PackageMinus, Package, Minus, Plus, Zap, History, Pause } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { EmptyState } from "@/components/EmptyState";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { SalidaCarritoLinea } from "../types";
import type { SalidasVista } from "..";
import styles from "./SalidaPOS.module.css";

// Mensaje de validación de una línea del carrito: null si está todo bien. Se usa tanto
// para el aviso visible bajo la línea como para decidir si "Confirmar" queda habilitado.
function mensajeInvalido(linea: SalidaCarritoLinea): string | null {
  if (!(linea.cantidad > 0)) return "La cantidad tiene que ser mayor a 0.";
  if (linea.cantidad > linea.stock_disponible) return `Solo hay ${linea.stock_disponible} disponibles.`;
  return null;
}

type MovimientoHoy = {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  fecha: string;
};

type CajaEnEspera = {
  id: string;
  hora: string;
  lineas: SalidaCarritoLinea[];
  totalUnidades: number;
  cliente: string;
  trabajador: string;
};

export function SalidaPOS({
  vista,
  onCambiarVista,
}: {
  vista: SalidasVista;
  onCambiarVista: (vista: SalidasVista) => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<SalidaCarritoLinea[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [salidasHoy, setSalidasHoy] = useState<MovimientoHoy[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cajasEnEspera, setCajasEnEspera] = useState<CajaEnEspera[]>([]);
  const [cliente, setCliente] = useState("");
  const [trabajador, setTrabajador] = useState("");

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(data.filter((p) => p.rastrear_inventario)))
      .catch(() => setProductos([]));
  }, []);

  const fetchSalidasHoy = async () => {
    const hoy = new Date().toLocaleDateString("en-CA");
    try {
      const res = await fetch(`/api/movimientos?tipo=salida&fecha=${hoy}`);
      if (res.ok) {
        const data = await res.json();
        setSalidasHoy(data);
      }
    } catch (err) {
      console.error("Error fetching salidas hoy:", err);
    }
  };

  useEffect(() => {
    fetchSalidasHoy();
  }, []);

  useEffect(() => {
    if (!mensajeExito) return;
    const timeout = setTimeout(() => setMensajeExito(null), 3000);
    return () => clearTimeout(timeout);
  }, [mensajeExito]);

  // El buscador arranca vacío a propósito: recién se muestran resultados cuando el
  // usuario empieza a escribir, no una vidriera con todo el catálogo de entrada.
  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return [];
    return productos
      .filter((p) => p.nombre.toLowerCase().includes(termino) || p.sku.toLowerCase().includes(termino))
      .slice(0, 30);
  }, [productos, busqueda]);

  function agregarAlCarrito(producto: Producto) {
    setMensajeExito(null);
    setCarrito((prev) => {
      const existente = prev.find((l) => l.producto_id === producto.id);
      if (existente) {
        return prev.map((l) => (l.producto_id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l));
      }
      return [
        ...prev,
        { producto_id: producto.id, producto_nombre: producto.nombre, cantidad: 1, stock_disponible: producto.stock },
      ];
    });
  }

  function actualizarCantidad(productoId: string, value: string | number) {
    setCarrito((prev) => prev.map((l) => {
      if (l.producto_id === productoId) {
        return { ...l, cantidad: (value === "" ? "" : Number(value)) as number };
      }
      return l;
    }));
  }

  function quitarDelCarrito(productoId: string) {
    setCarrito((prev) => prev.filter((l) => l.producto_id !== productoId));
  }

  function vaciarCarrito() {
    setCarrito([]);
    setCliente("");
    setTrabajador("");
    setError(null);
  }

  function ponerEnEspera() {
    if (carrito.length === 0) return;
    const now = new Date();
    const totalUnids = carrito.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0);
    const nuevaCaja: CajaEnEspera = {
      id: Date.now().toString(),
      hora: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lineas: [...carrito],
      totalUnidades: totalUnids,
      cliente,
      trabajador,
    };
    setCajasEnEspera((prev) => [...prev, nuevaCaja]);
    vaciarCarrito();
  }

  function recuperarCaja(id: string) {
    const caja = cajasEnEspera.find((c) => c.id === id);
    if (!caja) return;

    if (carrito.length > 0) {
      ponerEnEspera();
    }

    setCarrito(caja.lineas);
    setCliente(caja.cliente || "");
    setTrabajador(caja.trabajador || "");
    setCajasEnEspera((prev) => prev.filter((c) => c.id !== id));
  }

  function descartarCajaEnEspera(id: string) {
    setCajasEnEspera((prev) => prev.filter((c) => c.id !== id));
  }

  const hayLineaInvalida = carrito.some((l) => mensajeInvalido(l) !== null);
  const puedeConfirmar = carrito.length > 0 && !hayLineaInvalida && !guardando;
  const totalUnidades = carrito.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0);

  async function handleConfirmar() {
    if (!puedeConfirmar) return;
    setGuardando(true);
    setError(null);
    try {
      let motivoStr = "Salida rápida (POS)";
      const parts = [];
      if (cliente.trim()) parts.push(`Cliente: ${cliente.trim()}`);
      if (trabajador.trim()) parts.push(`Trab: ${trabajador.trim()}`);
      if (parts.length > 0) {
        motivoStr = `${motivoStr} | ${parts.join(" | ")}`;
      }

      const res = await fetch("/api/movimientos/salidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineas: carrito.map((l) => ({ producto_id: l.producto_id, cantidad: Number(l.cantidad) })),
          motivo: motivoStr,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo registrar la salida.");
      }
      setCarrito([]);
      setMensajeExito("Salida registrada correctamente.");
      fetchSalidasHoy();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setGuardando(false);
    }
  }

  const vistaActions: ModuleAction[] = [
    { key: "rapida", label: "Salida rápida", icon: Zap, active: vista === "rapida", onClick: () => onCambiarVista("rapida") },
    { key: "historial", label: "Historial", icon: History, active: vista === "historial", onClick: () => onCambiarVista("historial") },
  ];

  const sidebarContent = (
    <FilterSection title="Vista">
      <ModuleActions actions={vistaActions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      {mensajeExito && <p className={fieldStyles.successBanner}>{mensajeExito}</p>}

      <FilterLayout sidebarContent={sidebarContent} showAlphabetIndex={false}>
        <div className={styles.pos}>
          <div className={styles.buscador}>
            <WidgetCard title="Terminal de salidas" icon={Search}>
              <input
                type="text"
                className={fieldStyles.input}
                placeholder="Escribí un nombre o SKU y presioná Enter…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />

              <div className={styles.areaTrabajo}>
                {!busqueda.trim() ? (
                  <EmptyState
                    icon={Package}
                    title="Área de trabajo"
                    description="Escribí un nombre o SKU para buscar un producto y agregarlo a la caja."
                  />
                ) : resultados.length === 0 ? (
                  <EmptyState icon={Search} title="Sin resultados" description={`No encontramos ningún producto para "${busqueda}".`} />
                ) : (
                  <div className={styles.resultados}>
                    {resultados.map((producto) => (
                      <button
                        key={producto.id}
                        type="button"
                        className={styles.resultadoRow}
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={producto.stock <= 0}
                      >
                        <span className={styles.resultadoNombre}>
                          {producto.nombre}
                          <span className={styles.resultadoSku}>{producto.sku}</span>
                        </span>
                        <span className={styles.resultadoStock}>{producto.stock} disp.</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </WidgetCard>
          </div>

          <div className={styles.cajaArea}>
            <div 
              className={styles.cajaActualWidget} 
              onClick={() => setModalAbierto(true)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.cajaActualInfo}>
                <span className={styles.cajaActualLabel}>Caja Actual del Día</span>
                <span className={styles.cajaActualValue}>
                  {salidasHoy.length} {salidasHoy.length === 1 ? "movimiento" : "movimientos"} hoy
                </span>
              </div>
              <button className={styles.cajaActualAction} aria-label="Ver historial" tabIndex={-1}>
                <History size={16} />
                <span>Ver Resumen</span>
              </button>
            </div>

            <div className={styles.caja}>
              <WidgetCard
              title="Caja"
              icon={ShoppingCart}
              className={styles.cajaCard}
              headerAction={
                <div style={{ display: "flex", gap: "8px" }}>
                  {carrito.length > 0 && (
                    <button type="button" className={styles.btnEspera} onClick={ponerEnEspera}>
                      <Pause size={13} fill="currentColor" />
                      ESPERA
                    </button>
                  )}
                  {carrito.length > 0 && (
                    <button type="button" className={fieldStyles.deleteButton} onClick={vaciarCarrito}>
                      <Trash2 size={13} />
                      Vaciar
                    </button>
                  )}
                </div>
              }
            >
              {cajasEnEspera.length > 0 && (
                <div className={styles.esperaContainer}>
                  <p className={styles.esperaTitle}>Cajas en espera ({cajasEnEspera.length})</p>
                  <div className={styles.esperaItems}>
                    {cajasEnEspera.map((c) => (
                      <div key={c.id} className={styles.esperaItem}>
                        <div className={styles.esperaInfo}>
                          <span className={styles.esperaTime}>{c.hora}</span>
                          <span className={styles.esperaCount}>{c.totalUnidades} prod.</span>
                        </div>
                        <div className={styles.esperaActions}>
                          <button
                            type="button"
                            onClick={() => recuperarCaja(c.id)}
                            className={styles.esperaBtnRecuperar}
                          >
                            Recuperar
                          </button>
                          <button
                            type="button"
                            onClick={() => descartarCajaEnEspera(c.id)}
                            className={styles.esperaBtnDescartar}
                            aria-label="Descartar caja en espera"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", padding: "12px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
                <input
                  type="text"
                  className={fieldStyles.input}
                  style={{ flex: 1 }}
                  placeholder="Nombre del Cliente (Opcional)"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
                <input
                  type="text"
                  className={fieldStyles.input}
                  style={{ flex: 1 }}
                  placeholder="Nombre del Trabajador (Opcional)"
                  value={trabajador}
                  onChange={(e) => setTrabajador(e.target.value)}
                />
              </div>

              {carrito.length === 0 ? (
                <p className={styles.cajaVacia}>Buscá un producto a la izquierda para agregarlo acá.</p>
              ) : (
                <table className={styles.carritoTable}>
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Producto</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((linea) => {
                      const mensaje = mensajeInvalido(linea);
                      return (
                        <tr key={linea.producto_id}>
                          <td>
                            <input
                              type="number"
                              min={1}
                              data-error={mensaje ? "" : undefined}
                              value={linea.cantidad}
                              onChange={(e) => actualizarCantidad(linea.producto_id, e.target.value)}
                            />
                          </td>
                          <td>
                            {linea.producto_nombre}
                            {mensaje && <span className={styles.avisoStock}>{mensaje}</span>}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => quitarDelCarrito(linea.producto_id)}
                              aria-label="Quitar del carrito"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {carrito.length > 0 && (
                <div className={styles.totalRow}>
                  <span>Total de unidades</span>
                  <span>{totalUnidades}</span>
                </div>
              )}

              <button type="button" className={styles.confirmarBtn} disabled={!puedeConfirmar} onClick={handleConfirmar}>
                <PackageMinus size={16} />
                {guardando ? "Registrando…" : "Confirmar salida"}
              </button>
            </WidgetCard>
          </div>
          </div>
        </div>
      </FilterLayout>

      {modalAbierto && (
        <FloatingWindow title="Resumen de Caja del Día" onClose={() => setModalAbierto(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Total de productos despachados hoy</h3>
              <span className={styles.modalBadge}>{salidasHoy.length} registros</span>
            </div>
            
            {salidasHoy.length === 0 ? (
              <EmptyState 
                icon={Package} 
                title="Sin movimientos" 
                description="No se registraron salidas de productos el día de hoy." 
              />
            ) : (
              <div className={styles.modalTableContainer}>
                <table className={styles.modalTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style={{ textAlign: "right" }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salidasHoy.map((mov) => (
                      <tr key={mov.id}>
                        <td>{mov.producto_nombre}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{mov.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FloatingWindow>
      )}
    </div>
  );
}
