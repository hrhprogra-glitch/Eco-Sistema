"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Save, Trash2, FileDown, XCircle, CircleDollarSign } from "lucide-react";
import { ActionsDrawer } from "@/components/ui/ActionsDrawer";
import type { ModuleAction } from "@/components/ui/ModuleActions";
import fieldStyles from "@/components/ui/formFields.module.css";
import logo from "@/app/imagenes/logo.png";
import type { Contacto } from "@/components/contacto/types";
import type { Producto } from "@/components/inventario/types";
import type { Factura, EstadoFactura, FacturaPago } from "../types";
import { LineaItemsEditor, type LineaItem, calcularSubtotalLinea } from "@/components/ui/LineaItemsEditor";
import styles from "./FacturaForm.module.css";

const ESTADOS: EstadoFactura[] = ["borrador", "enviada", "pagada", "vencida"];
const ESTADO_LABEL: Record<EstadoFactura, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
  vencida: "Vencida",
};
const ESTADO_COLOR: Record<EstadoFactura, string> = {
  borrador: "var(--status-offline)",
  enviada: "var(--status-pending)",
  pagada: "var(--status-online)",
  vencida: "var(--status-error)",
};

const EMPRESA = {
  nombre: "ECO SISTEMAS URH S.A.C.",
  ruc: "20502059751",
  direccion: "MZ A LT 9 A.V NUEVAGALES CIENEGUILLA",
  telefonos: "998270102 – 985832096",
  email: "ecosistemas_urh_sac@hotmail.com",
  cuenta: {
    titulo: "CUENTA DE AHORRO SOLES BCP",
    soles: "193-27543218-0-31",
    cci: "002-193-127543218031-10",
    nombre: "ULICES RODRIGUEZ H.",
  },
};

const PRINT_AREA_ID = "factura-print-area";

export function FacturaForm({
  factura,
  onSaved,
  onCancel,
  onDeleted,
}: {
  factura?: Factura;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [contactoId, setContactoId] = useState(factura?.contacto_id ?? "");
  const [clienteQuery, setClienteQuery] = useState(factura?.contacto_nombre ?? "");
  const [clienteDropdownAbierto, setClienteDropdownAbierto] = useState(false);
  const [estado, setEstado] = useState<EstadoFactura>(factura?.estado ?? "borrador");
  const [fecha, setFecha] = useState(factura?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState(factura?.notas ?? "");
  const [lineas, setLineas] = useState<LineaItem[]>(
    factura?.lineas?.map((linea) => ({
      id: crypto.randomUUID(),
      tipo: "producto" as const,
      descripcion_superior: null,
      precio_general: null,
      productos: [
        {
          id: crypto.randomUUID(),
          producto_id: linea.producto_id ?? null,
          esLibre: !linea.producto_id,
          descripcion: linea.descripcion ?? null,
          cantidad: linea.cantidad,
          precio_unitario: linea.precio_unitario,
        },
      ],
    })) ?? []
  );
  const [pagos, setPagos] = useState<FacturaPago[]>(factura?.pagos ?? []);
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoFecha, setPagoFecha] = useState(new Date().toISOString().slice(0, 10));
  const [pagoMetodo, setPagoMetodo] = useState("");
  const [isRegistrandoPago, setIsRegistrandoPago] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportandoPdf, setIsExportandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contactos")
      .then((res) => (res.ok ? res.json() : []))
      .then(setContactos)
      .catch(() => setContactos([]));
    fetch("/api/productos")
      .then((res) => (res.ok ? res.json() : []))
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termino = clienteQuery.trim().toLowerCase();
    if (!termino) return contactos;
    return contactos.filter((c) => c.nombre.toLowerCase().includes(termino));
  }, [contactos, clienteQuery]);

  const clienteSeleccionado = contactos.find((c) => c.id === contactoId);
  const total = lineas.reduce((sum, linea) => sum + calcularSubtotalLinea(linea), 0);
  const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const saldoPendiente = total - totalPagado;
  const fechaLegible = fecha
    ? new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
    : "";

  // El editor de líneas trabaja con tarjetas (LineaItem), pero factura_lineas sigue
  // siendo una tabla plana: cada tarjeta "descripcion" se manda como una fila directa, y
  // cada tarjeta "producto" se aplana a una fila por producto (o a una sola fila con el
  // precio general, si está cargado, para no duplicar el importe de la tarjeta).
  function aplanarLineas(cartas: LineaItem[]) {
    const filas: { producto_id: string | null; descripcion: string | null; cantidad: number; precio_unitario: number; subtotal: number }[] = [];
    for (const carta of cartas) {
      if (carta.tipo === "descripcion") {
        filas.push({ producto_id: null, descripcion: carta.descripcion, cantidad: 1, precio_unitario: carta.precio, subtotal: carta.precio });
        continue;
      }
      if (carta.precio_general) {
        const nombres = carta.productos.map((p) => productos.find((prod) => prod.id === p.producto_id)?.nombre ?? p.descripcion).filter(Boolean);
        const descripcion = [carta.descripcion_superior, ...nombres].filter(Boolean).join(" - ") || null;
        filas.push({ producto_id: null, descripcion, cantidad: 1, precio_unitario: carta.precio_general, subtotal: carta.precio_general });
        continue;
      }
      for (const p of carta.productos) {
        filas.push({
          producto_id: p.producto_id ?? null,
          descripcion: p.descripcion ?? null,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.cantidad * p.precio_unitario,
        });
      }
    }
    return filas;
  }

  function seleccionarCliente(contacto: Contacto) {
    setContactoId(contacto.id);
    setClienteQuery(contacto.nombre);
    setClienteDropdownAbierto(false);
  }

  async function handleSave() {
    if (!contactoId) {
      setError("Elegí un cliente.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = { contacto_id: contactoId, estado, total, fecha, notas, lineas: aplanarLineas(lineas) };
      const res = await fetch(factura ? `/api/facturas/${factura.id}` : "/api/facturas", {
        method: factura ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la factura.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!factura) return;
    if (!window.confirm(`¿Eliminar la factura #${factura.numero}? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/facturas/${factura.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la factura.");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  async function handleRegistrarPago() {
    if (!factura) return;
    const monto = Number(pagoMonto);
    if (!monto || monto <= 0) {
      setError("Ingresá un monto de pago válido.");
      return;
    }

    setIsRegistrandoPago(true);
    setError(null);
    try {
      const res = await fetch(`/api/facturas/${factura.id}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto, fecha: pagoFecha, metodo: pagoMetodo || null }),
      });
      if (!res.ok) throw new Error("No se pudo registrar el pago.");
      const nuevoPago: FacturaPago = await res.json();
      setPagos((prev) => [...prev, nuevoPago]);
      setPagoMonto("");
      setPagoMetodo("");
      if (totalPagado + monto >= total) setEstado("pagada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsRegistrandoPago(false);
    }
  }

  async function handleExportarPdf() {
    setIsExportandoPdf(true);
    setError(null);
    try {
      const element = document.getElementById(PRINT_AREA_ID);
      if (!element) throw new Error("No se encontró el documento a exportar.");

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`factura-${factura?.numero ?? "nueva"}.pdf`);
    } catch {
      setError("No se pudo exportar el PDF.");
    } finally {
      setIsExportandoPdf(false);
    }
  }

  const actions: ModuleAction[] = [
    { key: "guardar", icon: Save, label: "Guardar y cerrar", onClick: handleSave, disabled: isSaving, tone: "primary" },
    ...(factura
      ? [{ key: "eliminar", icon: Trash2, label: "Eliminar", onClick: handleDelete, disabled: isSaving, tone: "danger" as const }]
      : []),
    { key: "exportar-pdf", icon: FileDown, label: "Exportar PDF", onClick: handleExportarPdf, disabled: isExportandoPdf },
    {
      key: "registrar-pago",
      icon: CircleDollarSign,
      label: "Registrar pago",
      disabled: !factura,
      onClick: () => document.getElementById("pago-monto-input")?.focus(),
    },
    { key: "cerrar", icon: XCircle, label: "Cerrar factura", onClick: onCancel },
  ];

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <ActionsDrawer actions={actions} />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <div className={styles.page}>
        <div className={styles.layout}>
          {/* Editor */}
          <div className={styles.editor}>
            {factura?.cotizacion_id && (
              <p className={styles.origenNota}>Generada desde una cotización aceptada.</p>
            )}
            <div className={fieldStyles.row}>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Cliente</span>
                <div className={styles.clienteBox}>
                  <input
                    className={fieldStyles.input}
                    placeholder="Buscar cliente…"
                    value={clienteQuery}
                    onChange={(e) => {
                      setClienteQuery(e.target.value);
                      setContactoId("");
                      setClienteDropdownAbierto(true);
                    }}
                    onFocus={() => setClienteDropdownAbierto(true)}
                    onBlur={() => setTimeout(() => setClienteDropdownAbierto(false), 150)}
                  />
                  {clienteDropdownAbierto && (
                    <div className={styles.clienteDropdown}>
                      {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((contacto) => (
                          <div
                            key={contacto.id}
                            className={styles.clienteOption}
                            onMouseDown={() => seleccionarCliente(contacto)}
                          >
                            {contacto.nombre}
                          </div>
                        ))
                      ) : (
                        <div className={styles.clienteEmpty}>Sin resultados.</div>
                      )}
                    </div>
                  )}
                </div>
              </label>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Estado</span>
                <select
                  className={fieldStyles.select}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoFactura)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {ESTADO_LABEL[e]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Fecha</span>
                <input
                  type="date"
                  className={fieldStyles.input}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </label>
            </div>

            <p className={fieldStyles.sectionTitle}>Productos</p>
            <LineaItemsEditor value={lineas} onChange={setLineas} />

            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Notas</span>
              <textarea
                className={fieldStyles.textarea}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </label>

            <div className={styles.pagosSection}>
              <div className={styles.pagosHeader}>
                <p className={fieldStyles.sectionTitle} style={{ margin: 0 }}>
                  Pagos
                </p>
                <span className={styles.pagosSaldo}>
                  Pagado: <strong>{totalPagado.toFixed(2)}</strong> · Saldo: <strong>{saldoPendiente.toFixed(2)}</strong>
                </span>
              </div>

              {!factura ? (
                <p className={styles.pagosEmpty}>Guardá la factura para poder registrar pagos.</p>
              ) : (
                <>
                  {pagos.length > 0 ? (
                    <div className={styles.pagosList}>
                      {pagos.map((pago) => (
                        <div key={pago.id} className={styles.pagoRow}>
                          <span>{pago.fecha?.slice(0, 10)}</span>
                          <span>{pago.metodo || "—"}</span>
                          <span className={styles.pagoRowMonto}>{Number(pago.monto).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.pagosEmpty}>Todavía no se registraron pagos.</p>
                  )}

                  <div className={styles.pagoForm}>
                    <label className={styles.pagoFormField}>
                      Monto
                      <input
                        id="pago-monto-input"
                        type="number"
                        min={0}
                        step="0.01"
                        className={fieldStyles.input}
                        value={pagoMonto}
                        onChange={(e) => setPagoMonto(e.target.value)}
                      />
                    </label>
                    <label className={styles.pagoFormField}>
                      Fecha
                      <input
                        type="date"
                        className={fieldStyles.input}
                        value={pagoFecha}
                        onChange={(e) => setPagoFecha(e.target.value)}
                      />
                    </label>
                    <label className={styles.pagoFormField}>
                      Método
                      <input
                        type="text"
                        placeholder="Transferencia, efectivo…"
                        className={fieldStyles.input}
                        value={pagoMetodo}
                        onChange={(e) => setPagoMetodo(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.pagoFormSubmit}
                      onClick={handleRegistrarPago}
                      disabled={isRegistrandoPago}
                    >
                      Registrar pago
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Previsualización */}
          <div className={styles.preview}>
            <p className={styles.previewLabel}>Previsualización</p>
            <div id={PRINT_AREA_ID} className={styles.sheet}>
              <div className={styles.sheetHeader}>
                <div className={styles.sheetEmpresa}>
                  <Image src={logo} alt={EMPRESA.nombre} className={styles.sheetLogo} />
                  <div>
                    <p className={styles.sheetEmpresaNombre}>{EMPRESA.nombre}</p>
                    <p className={styles.sheetEmpresaDato}>{EMPRESA.direccion}</p>
                    <p className={styles.sheetEmpresaDato}>TELF: {EMPRESA.telefonos}</p>
                    <p className={styles.sheetEmpresaDato}>e-mail: {EMPRESA.email}</p>
                  </div>
                </div>
                <div className={styles.sheetDocBox}>
                  <div className={styles.sheetRucBox}>
                    <span>R.U.C. N°</span>
                    <strong>{EMPRESA.ruc}</strong>
                  </div>
                  <div className={styles.sheetTituloBox}>FACTURA</div>
                </div>
              </div>

              <table className={styles.sheetInfoTable}>
                <tbody>
                  <tr>
                    <td className={styles.sheetInfoLabel}>SEÑOR(ES):</td>
                    <td>{clienteSeleccionado?.nombre ?? "—"}</td>
                  </tr>
                  <tr>
                    <td className={styles.sheetInfoLabel}>FECHA:</td>
                    <td>{fechaLegible}</td>
                  </tr>
                  <tr>
                    <td className={styles.sheetInfoLabel}>ESTADO:</td>
                    <td>
                      <span className={styles.estadoPill} style={{ color: ESTADO_COLOR[estado] }}>
                        {ESTADO_LABEL[estado]}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {lineas.length > 0 ? (
                <table className={styles.sheetTable}>
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((carta) => {
                      if (carta.tipo === "descripcion") {
                        return (
                          <tr key={carta.id}>
                            <td></td>
                            <td className={carta.negritaDescripcion ? styles.sheetTextoNegrita : undefined}>
                              {carta.descripcion || "—"}
                            </td>
                            <td className={carta.negritaPrecio ? styles.sheetTextoNegrita : undefined}>
                              {carta.precio ? `U$ ${carta.precio.toFixed(2)}` : ""}
                            </td>
                          </tr>
                        );
                      }
                      const tienePrecioGeneral = !!carta.precio_general;
                      const tieneEncabezado = !!carta.descripcion_superior;
                      const mostrarFilaSuperior = tieneEncabezado || tienePrecioGeneral;
                      return [
                        <tr key={carta.id}>
                          <td colSpan={3} className={styles.sheetCeldaCartaProducto}>
                            <table className={styles.sheetSubTabla}>
                              <tbody>
                                {mostrarFilaSuperior && (
                                  <tr>
                                    <td></td>
                                    <td className={styles.sheetItemEncabezado}>{carta.descripcion_superior || " "}</td>
                                    <td className={tienePrecioGeneral && carta.negritaPrecioGeneral ? styles.sheetTextoNegrita : undefined}>
                                      {tienePrecioGeneral ? `U$ ${(carta.precio_general as number).toFixed(2)}` : ""}
                                    </td>
                                  </tr>
                                )}
                                {carta.productos.map((p) => {
                                  const producto = productos.find((prod) => prod.id === p.producto_id);
                                  return (
                                    <tr key={p.id}>
                                      <td>{p.cantidad || ""}</td>
                                      <td className={p.negritaDescripcion ? styles.sheetTextoNegrita : undefined}>
                                        {producto?.nombre ?? p.descripcion ?? "—"}
                                      </td>
                                      <td className={p.negritaPrecio ? styles.sheetTextoNegrita : undefined}>
                                        {p.precio_unitario ? `U$ ${(p.cantidad * p.precio_unitario).toFixed(2)}` : ""}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>,
                      ];
                    })}
                  </tbody>
                </table>
              ) : (
                <p className={styles.sheetEmpty}>Todavía no agregaste productos.</p>
              )}

              <div className={styles.sheetTotal}>
                <span>TOTAL</span>
                <span>U$ {total.toFixed(2)}</span>
              </div>

              {pagos.length > 0 && (
                <div className={styles.sheetPagos}>
                  <span>
                    Pagado: <strong>U$ {totalPagado.toFixed(2)}</strong>
                  </span>
                  <span>
                    Saldo: <strong>U$ {saldoPendiente.toFixed(2)}</strong>
                  </span>
                </div>
              )}

              {notas && <p className={styles.sheetNotas}>{notas}</p>}

              <div className={styles.sheetCuenta}>
                <p>{EMPRESA.cuenta.titulo}</p>
                <p>BCP SOLES: {EMPRESA.cuenta.soles}</p>
                <p>CCI: {EMPRESA.cuenta.cci}</p>
                <p>NOMBRE: {EMPRESA.cuenta.nombre}</p>
              </div>

              <div className={styles.sheetFooter}>
                <p className={styles.sheetFooterStrong}>&quot;GRACIAS POR SU PREFERENCIA&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
