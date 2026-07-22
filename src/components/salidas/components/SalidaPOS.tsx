"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, Trash2, PackageMinus, Package, Minus, Plus, Zap, History, Pause, Pencil } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { EmptyState } from "@/components/EmptyState";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import { NombreBuscador } from "@/components/ui/NombreBuscador";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { Contacto } from "@/components/contacto/types";
import type { Empleado } from "@/components/empleados/types";
import type { SalidaCarritoLinea, MovimientoStock } from "../types";
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
  movimientoEditar,
  onTerminarEdicion,
}: {
  vista: SalidasVista;
  onCambiarVista: (vista: SalidasVista) => void;
  // Cuando viene seteado, la Caja arranca precargada con esa línea (una salida ya
  // confirmada, elegida haciendo clic en una fila del Historial) en vez de vacía, y
  // "Confirmar salida" pasa a editar ese movimiento (PUT) en lugar de crear uno nuevo.
  movimientoEditar?: MovimientoStock | null;
  onTerminarEdicion?: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<SalidaCarritoLinea[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [salidasHoy, setSalidasHoy] = useState<MovimientoHoy[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cajasEnEspera, setCajasEnEspera] = useState<CajaEnEspera[]>([]);
  const [cliente, setCliente] = useState("");
  const [trabajador, setTrabajador] = useState("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const prefillEditRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(data.filter((p) => p.rastrear_inventario)))
      .catch(() => setProductos([]));

    fetch("/api/contactos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Contacto[]) => setContactos(data.filter((c) => c.tipo === "cliente")))
      .catch(() => setContactos([]));

    fetch("/api/empleados")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Empleado[]) => setEmpleados(data))
      .catch(() => setEmpleados([]));
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

  // Precarga la Caja con la línea del movimiento elegido en el Historial. El stock
  // disponible para validar la cantidad es el stock actual del producto MÁS lo que este
  // mismo movimiento ya había descontado (si no, "cuánto puedo poner" quedaría corto en
  // exactamente lo que esta salida ya se llevó). Como el catálogo de productos llega por
  // un fetch aparte, puede no estar listo todavía en el primer pase -- por eso el efecto
  // también corre de nuevo cuando `productos` cambia, pero solo para corregir el stock
  // disponible de esa línea sin pisar lo que el usuario ya haya tocado.
  useEffect(() => {
    if (!movimientoEditar) return;
    const prod = productos.find((p) => p.id === movimientoEditar.producto_id);
    const stockDisponible = (prod?.stock ?? 0) + Number(movimientoEditar.cantidad);

    if (prefillEditRef.current !== movimientoEditar.id) {
      prefillEditRef.current = movimientoEditar.id;
      setCarrito([
        {
          producto_id: movimientoEditar.producto_id,
          producto_nombre: movimientoEditar.producto_nombre,
          cantidad: Number(movimientoEditar.cantidad),
          stock_disponible: stockDisponible,
        },
      ]);
      setCliente(movimientoEditar.cliente || "");
      setTrabajador(movimientoEditar.trabajador || "");
      setEditandoId(movimientoEditar.id);
    } else {
      setCarrito((prev) =>
        prev.map((l) =>
          l.producto_id === movimientoEditar.producto_id ? { ...l, stock_disponible: stockDisponible } : l
        )
      );
    }
  }, [movimientoEditar, productos]);

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
    if (editandoId) return;
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
    if (editandoId) {
      setEditandoId(null);
      prefillEditRef.current = null;
      onTerminarEdicion?.();
    }
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

  const hayLineaInvalida = carrito.some((l) => mensajeInvalido(l) !== null);
  const puedeConfirmar = carrito.length > 0 && !hayLineaInvalida && !guardando;
  const totalUnidades = carrito.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0);

  async function handleConfirmar() {
    if (!puedeConfirmar) return;
    setGuardando(true);
    try {
      if (editandoId) {
        const linea = carrito[0];
        const res = await fetch(`/api/movimientos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cantidad: Number(linea.cantidad),
            cliente: cliente.trim() || null,
            trabajador: trabajador.trim() || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo guardar la edición.");
        }
        setCarrito([]);
        setCliente("");
        setTrabajador("");
        setEditandoId(null);
        prefillEditRef.current = null;
        onTerminarEdicion?.();
        onCambiarVista("historial");
        return;
      }

      const res = await fetch("/api/movimientos/salidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineas: carrito.map((l) => ({ producto_id: l.producto_id, cantidad: Number(l.cantidad) })),
          cliente: cliente.trim() || undefined,
          trabajador: trabajador.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo registrar la salida.");
      }
      setCarrito([]);
      fetchSalidasHoy();
    } catch (err) {
      console.error("Error al confirmar salida:", err);
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
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap", maxWidth: "100%", overflowX: "auto" }}>
                  {carrito.length > 0 && (
                    <button type="button" className={styles.btnEspera} onClick={ponerEnEspera}>
                      <Pause size={13} fill="currentColor" />
                      ESPERA
                    </button>
                  )}
                  {cajasEnEspera.length > 0 && (
                    <div className={styles.esperaNumeros}>
                      {cajasEnEspera.map((c, idx) => (
                        <button
                          key={c.id}
                          type="button"
                          className={styles.esperaNumBox}
                          onClick={() => recuperarCaja(c.id)}
                          title={`${c.hora} · ${c.totalUnidades} prod. — clic para atender`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  {carrito.length > 0 && (
                    <button type="button" className={fieldStyles.deleteButton} onClick={vaciarCarrito}>
                      <Trash2 size={13} />
                      {editandoId ? "Cancelar edición" : "Vaciar"}
                    </button>
                  )}
                </div>
              }
            >
              {editandoId && (
                <div className={styles.editandoAviso}>
                  <Pencil size={13} />
                  Editando salida de {carrito[0]?.producto_nombre}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", padding: "12px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
                <div style={{ flex: 1 }}>
                  <NombreBuscador
                    value={cliente}
                    onChange={setCliente}
                    placeholder="Nombre del Cliente (Opcional)"
                    opciones={contactos.map((c) => ({ id: c.id, nombre: c.nombre, subtitulo: c.telefono || c.email || undefined }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <NombreBuscador
                    value={trabajador}
                    onChange={setTrabajador}
                    placeholder="Nombre del Trabajador (Opcional)"
                    opciones={empleados.map((e) => ({ id: e.id, nombre: e.nombre, subtitulo: e.puesto || undefined }))}
                  />
                </div>
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
                            {!editandoId && (
                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => quitarDelCarrito(linea.producto_id)}
                                aria-label="Quitar del carrito"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
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
                {guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Confirmar salida"}
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
