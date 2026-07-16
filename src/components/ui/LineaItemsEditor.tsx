"use client";

import { useEffect, useState } from "react";
import { Trash2, Package, FileText, Plus, GripVertical, Bold } from "lucide-react";
import type { Producto } from "@/components/inventario/types";
import fieldStyles from "./formFields.module.css";
import styles from "./LineaItemsEditor.module.css";

export type ProductoEnCarta = {
  id: string;
  producto_id?: string | null;
  descripcion?: string | null;
  esLibre?: boolean;
  cantidad: number;
  precio_unitario: number;
  negritaDescripcion?: boolean;
  negritaPrecio?: boolean;
};

// Cada línea del presupuesto es una "tarjeta" de uno de dos tipos: una Descripción
// (texto + un precio directo, sin cantidad) o un grupo de Producto (encabezado opcional,
// un Precio general opcional, y uno o más productos reales/externos con su propia
// cantidad y precio). El Precio general y los precios individuales nunca se ocultan entre
// sí -el usuario elige cuál llenar-: si hay Precio general, ese manda para el total de la
// tarjeta; si no, se usa la suma de los productos.
export type LineaItem =
  | {
      id: string;
      tipo: "descripcion";
      descripcion: string;
      precio: number;
      negritaDescripcion?: boolean;
      negritaPrecio?: boolean;
    }
  | {
      id: string;
      tipo: "producto";
      descripcion_superior?: string | null;
      precio_general?: number | null;
      negritaPrecioGeneral?: boolean;
      productos: ProductoEnCarta[];
    };

// Los campos de descripción (Descripción, Encabezado, producto libre) son textareas que
// crecen solas con el contenido -en vez de inputs de una sola línea- para poder escribir
// textos largos con Shift+Enter/Enter sin que el texto se corte ni se pise.
function ajustarAlturaTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function crearId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function calcularSubtotalLinea(linea: LineaItem): number {
  if (linea.tipo === "descripcion") return linea.precio || 0;
  if (linea.precio_general) return linea.precio_general;
  return linea.productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);
}

// Buscador de producto (escribir para filtrar, como el de Cliente en Cotización) en vez
// de un <select> con todo el catálogo. Vive en su propio componente para que cada fila
// tenga su propio estado de búsqueda/dropdown, sin que el padre tenga que llevar un mapa
// de "qué fila tiene el dropdown abierto".
function ProductoBuscador({
  productos,
  productoId,
  onSeleccionar,
  onUsarExterno,
}: {
  productos: Producto[];
  productoId?: string | null;
  onSeleccionar: (producto: Producto) => void;
  onUsarExterno: (texto: string) => void;
}) {
  const seleccionado = productos.find((p) => p.id === productoId);
  const [query, setQuery] = useState(seleccionado?.nombre ?? "");
  const [abierto, setAbierto] = useState(false);

  const termino = query.trim().toLowerCase();
  const filtrados = termino ? productos.filter((p) => p.nombre.toLowerCase().includes(termino)) : productos;

  return (
    <div className={styles.productoBuscador}>
      <input
        type="text"
        className={fieldStyles.input}
        placeholder="Buscar producto…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
      />
      {abierto && (
        <div className={styles.productoDropdown}>
          {filtrados.length > 0 ? (
            filtrados.map((producto) => (
              <div
                key={producto.id}
                className={styles.productoOption}
                onMouseDown={() => {
                  setQuery(producto.nombre);
                  setAbierto(false);
                  onSeleccionar(producto);
                }}
              >
                {producto.nombre}
              </div>
            ))
          ) : (
            <div className={styles.productoEmpty}>Sin resultados.</div>
          )}
          {termino && (
            <div
              className={styles.productoExterno}
              onMouseDown={() => {
                setAbierto(false);
                onUsarExterno(query.trim());
              }}
            >
              Usar &quot;{query.trim()}&quot; como producto externo
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Botón chico para marcar en negrita una descripción o un precio en la previsualización/PDF
// -el usuario lo usa para resaltar qué producto es importante o qué precio es general-.
function NegritaToggle({ activo, onToggle }: { activo: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.negritaToggle} ${activo ? styles.negritaToggleActivo : ""}`}
      onClick={onToggle}
      aria-pressed={activo}
      title="Negrita"
    >
      <Bold size={14} />
    </button>
  );
}

function nuevoProductoEnCarta(): ProductoEnCarta {
  return { id: crearId(), producto_id: "", cantidad: 0, precio_unitario: 0 };
}

export function LineaItemsEditor({
  value,
  onChange,
}: {
  value: LineaItem[];
  onChange: (lineas: LineaItem[]) => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Producto[]) => setProductos(data))
      .catch(() => setProductos([]));
  }, []);

  function updateLinea(index: number, patch: Partial<LineaItem>) {
    onChange(value.map((linea, i) => (i === index ? ({ ...linea, ...patch } as LineaItem) : linea)));
  }

  function addLineaProducto() {
    onChange([...value, { id: crearId(), tipo: "producto", descripcion_superior: "", precio_general: null, productos: [nuevoProductoEnCarta()] }]);
  }

  function addLineaDescripcion() {
    onChange([...value, { id: crearId(), tipo: "descripcion", descripcion: "", precio: 0 }]);
  }

  function removeLinea(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moverLinea(idOrigen: string, idDestino: string) {
    if (idOrigen === idDestino) return;
    const origenIdx = value.findIndex((l) => l.id === idOrigen);
    const destinoIdx = value.findIndex((l) => l.id === idDestino);
    if (origenIdx === -1 || destinoIdx === -1) return;
    const copia = [...value];
    const [movido] = copia.splice(origenIdx, 1);
    copia.splice(destinoIdx, 0, movido);
    onChange(copia);
  }

  // --- Helpers para tarjetas de tipo "producto" ---
  function updateProductoEnCarta(cartaIndex: number, productoIndex: number, patch: Partial<ProductoEnCarta>) {
    const carta = value[cartaIndex];
    if (carta.tipo !== "producto") return;
    const productos = carta.productos.map((p, i) => (i === productoIndex ? { ...p, ...patch } : p));
    updateLinea(cartaIndex, { productos } as Partial<LineaItem>);
  }

  function handleSeleccionarProducto(cartaIndex: number, productoIndex: number, producto: Producto) {
    const carta = value[cartaIndex];
    if (carta.tipo !== "producto") return;
    const actual = carta.productos[productoIndex];
    const precio = producto.precio ?? 0;
    const cantidad = actual.cantidad || 1;
    updateProductoEnCarta(cartaIndex, productoIndex, {
      producto_id: producto.id,
      esLibre: false,
      descripcion: null,
      precio_unitario: precio,
      cantidad,
    });
  }

  function handleUsarExterno(cartaIndex: number, productoIndex: number, texto: string) {
    updateProductoEnCarta(cartaIndex, productoIndex, {
      producto_id: null,
      esLibre: true,
      descripcion: texto,
    });
  }

  function toggleModoProducto(cartaIndex: number, productoIndex: number) {
    const carta = value[cartaIndex];
    if (carta.tipo !== "producto") return;
    const actual = carta.productos[productoIndex];
    if (actual.esLibre) {
      updateProductoEnCarta(cartaIndex, productoIndex, { esLibre: false, descripcion: null, producto_id: "" });
    } else {
      updateProductoEnCarta(cartaIndex, productoIndex, { esLibre: true, producto_id: null, descripcion: "" });
    }
  }

  function agregarProductoACarta(cartaIndex: number) {
    const carta = value[cartaIndex];
    if (carta.tipo !== "producto") return;
    updateLinea(cartaIndex, { productos: [...carta.productos, nuevoProductoEnCarta()] } as Partial<LineaItem>);
  }

  function quitarProductoDeCarta(cartaIndex: number, productoIndex: number) {
    const carta = value[cartaIndex];
    if (carta.tipo !== "producto" || carta.productos.length <= 1) return;
    updateLinea(cartaIndex, { productos: carta.productos.filter((_, i) => i !== productoIndex) } as Partial<LineaItem>);
  }

  const total = value.reduce((sum, linea) => sum + calcularSubtotalLinea(linea), 0);

  return (
    <div className={styles.wrapper}>
      {value.map((linea, index) => (
        <div
          key={linea.id}
          className={styles.itemCard}
          draggable
          data-dragging={arrastrandoId === linea.id ? "" : undefined}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", linea.id);
            setArrastrandoId(linea.id);
          }}
          onDragEnd={() => setArrastrandoId(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const idOrigen = e.dataTransfer.getData("text/plain");
            moverLinea(idOrigen, linea.id);
          }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.dragHandle} title="Arrastrar para reordenar">
              <GripVertical size={16} />
            </span>
            <span className={styles.cardTipoLabel}>
              {linea.tipo === "descripcion" ? "Descripción" : "Producto"}
            </span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeLinea(index)}
              aria-label="Quitar tarjeta"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {linea.tipo === "descripcion" ? (
            <div className={styles.filaAncha}>
              <label className={styles.datoCampo}>
                <span className={styles.datoLabel}>Descripción</span>
                <div className={styles.campoConNegrita}>
                  <textarea
                    ref={ajustarAlturaTextarea}
                    className={`${fieldStyles.textarea} ${styles.textareaAuto}`}
                    placeholder="Descripción…"
                    rows={1}
                    value={linea.descripcion}
                    onInput={(e) => ajustarAlturaTextarea(e.currentTarget)}
                    onChange={(e) => updateLinea(index, { descripcion: e.target.value } as Partial<LineaItem>)}
                  />
                  <NegritaToggle
                    activo={!!linea.negritaDescripcion}
                    onToggle={() => updateLinea(index, { negritaDescripcion: !linea.negritaDescripcion } as Partial<LineaItem>)}
                  />
                </div>
              </label>
              <label className={styles.datoCampo}>
                <span className={styles.datoLabel}>Precio</span>
                <div className={styles.campoConNegrita}>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={fieldStyles.input}
                    value={linea.precio === 0 ? "" : linea.precio}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    onChange={(e) =>
                      updateLinea(index, { precio: e.target.value === "" ? 0 : Number(e.target.value) } as Partial<LineaItem>)
                    }
                  />
                  <NegritaToggle
                    activo={!!linea.negritaPrecio}
                    onToggle={() => updateLinea(index, { negritaPrecio: !linea.negritaPrecio } as Partial<LineaItem>)}
                  />
                </div>
              </label>
            </div>
          ) : (
            <>
              <div className={styles.filaAncha}>
                <label className={styles.datoCampo}>
                  <span className={styles.datoLabel}>Encabezado (opcional)</span>
                  <textarea
                    ref={ajustarAlturaTextarea}
                    className={`${fieldStyles.textarea} ${styles.textareaAuto} ${styles.encabezadoInput}`}
                    placeholder="Encabezado…"
                    rows={1}
                    value={linea.descripcion_superior ?? ""}
                    onInput={(e) => ajustarAlturaTextarea(e.currentTarget)}
                    onChange={(e) => updateLinea(index, { descripcion_superior: e.target.value } as Partial<LineaItem>)}
                  />
                </label>
                <label className={styles.datoCampo}>
                  <span className={styles.datoLabel}>Precio general (opcional)</span>
                  <div className={styles.campoConNegrita}>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={fieldStyles.input}
                      placeholder="—"
                      value={linea.precio_general ? linea.precio_general : ""}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        updateLinea(index, {
                          precio_general: e.target.value === "" ? null : Number(e.target.value),
                        } as Partial<LineaItem>)
                      }
                    />
                    <NegritaToggle
                      activo={!!linea.negritaPrecioGeneral}
                      onToggle={() => updateLinea(index, { negritaPrecioGeneral: !linea.negritaPrecioGeneral } as Partial<LineaItem>)}
                    />
                  </div>
                </label>
              </div>

              {linea.productos.map((prodLinea, productoIndex) => (
                <div key={prodLinea.id} className={styles.productoSubcard}>
                  <div className={styles.campoConNegrita}>
                    {prodLinea.esLibre ? (
                      <textarea
                        ref={ajustarAlturaTextarea}
                        className={`${fieldStyles.textarea} ${styles.textareaAuto}`}
                        placeholder="Descripción libre…"
                        rows={1}
                        value={prodLinea.descripcion ?? ""}
                        onInput={(e) => ajustarAlturaTextarea(e.currentTarget)}
                        onChange={(e) => updateProductoEnCarta(index, productoIndex, { descripcion: e.target.value })}
                      />
                    ) : (
                      <ProductoBuscador
                        productos={productos}
                        productoId={prodLinea.producto_id}
                        onSeleccionar={(producto) => handleSeleccionarProducto(index, productoIndex, producto)}
                        onUsarExterno={(texto) => handleUsarExterno(index, productoIndex, texto)}
                      />
                    )}
                    <NegritaToggle
                      activo={!!prodLinea.negritaDescripcion}
                      onToggle={() =>
                        updateProductoEnCarta(index, productoIndex, { negritaDescripcion: !prodLinea.negritaDescripcion })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.modoToggle}
                    onClick={() => toggleModoProducto(index, productoIndex)}
                  >
                    {prodLinea.esLibre ? "Vincular producto" : "Producto externo"}
                  </button>

                  <div className={styles.datosRow}>
                    <label className={styles.datoCampo}>
                      <span className={styles.datoLabel}>Cantidad</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={fieldStyles.input}
                        value={prodLinea.cantidad === 0 ? "" : prodLinea.cantidad}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        onChange={(e) =>
                          updateProductoEnCarta(index, productoIndex, {
                            cantidad: e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label className={styles.datoCampo}>
                      <span className={styles.datoLabel}>Precio unitario</span>
                      <div className={styles.campoConNegrita}>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={fieldStyles.input}
                          value={prodLinea.precio_unitario === 0 ? "" : prodLinea.precio_unitario}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.currentTarget.select()}
                          onChange={(e) =>
                            updateProductoEnCarta(index, productoIndex, {
                              precio_unitario: e.target.value === "" ? 0 : Number(e.target.value),
                            })
                          }
                        />
                        <NegritaToggle
                          activo={!!prodLinea.negritaPrecio}
                          onToggle={() =>
                            updateProductoEnCarta(index, productoIndex, { negritaPrecio: !prodLinea.negritaPrecio })
                          }
                        />
                      </div>
                    </label>
                    <div className={styles.datoCampo}>
                      <span className={styles.datoLabel}>Subtotal</span>
                      <span className={styles.subtotal}>{(prodLinea.cantidad * prodLinea.precio_unitario).toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => quitarProductoDeCarta(index, productoIndex)}
                      aria-label="Quitar producto"
                      disabled={linea.productos.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className={styles.addProductoButton} onClick={() => agregarProductoACarta(index)}>
                <Plus size={14} />
                Agregar otro producto
              </button>
            </>
          )}

          <div className={styles.cardTotalRow}>
            <span>Subtotal de la tarjeta</span>
            <span>{calcularSubtotalLinea(linea).toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className={styles.addButtonsRow}>
        <button type="button" className={styles.addButton} onClick={addLineaProducto}>
          <Package size={16} />
          Agregar producto
        </button>
        <button type="button" className={styles.addButton} onClick={addLineaDescripcion}>
          <FileText size={16} />
          Agregar descripción
        </button>
      </div>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
