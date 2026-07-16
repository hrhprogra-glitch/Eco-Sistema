"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Save, Trash2, Printer, XCircle, Upload, CheckCircle2, RotateCcw, Bold, Italic, Plus, X } from "lucide-react";
import { ActionsDrawer } from "@/components/ui/ActionsDrawer";
import type { ModuleAction } from "@/components/ui/ModuleActions";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import logo from "@/app/imagenes/logo.png";
import type { Contacto } from "@/components/contacto/types";
import type { Producto } from "@/components/inventario/types";
import type { Cotizacion, EstadoCotizacion, LineasModo, LineasLibres, FilaLibre } from "../types";
import { LineaItemsEditor, type LineaItem, calcularSubtotalLinea } from "@/components/ui/LineaItemsEditor";
import { procesarCotizacionWord } from "../importarWord";
import { useRegistrarUndoRedo } from "@/components/undoRedo/UndoRedoProvider";
import styles from "./CotizacionForm.module.css";

// Celda editable directo sobre la hoja para el modo "libre" (importado de Word): sin
// controlar cada tecla por React -que pelearía con la posición del cursor-, el HTML solo
// se confirma al perder el foco (igual que CeldaEditable en Ecosistema-Document).
function CeldaEditable({
  className,
  html,
  onCommit,
}: {
  className?: string;
  html: string;
  onCommit: (html: string) => void;
}) {
  return (
    <div
      className={className}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
      onBlur={(e) => onCommit(e.currentTarget.innerHTML)}
    />
  );
}

function parsearMontoLibre(texto: string): number {
  const soloDigitos = texto.replace(/[^\d.,]/g, "").replace(/,/g, "");
  return parseFloat(soloDigitos) || 0;
}

type TipoDocumento = "COTIZACIÓN" | "LIQUIDACIÓN DE SERVICIO";
type TipoPago = "BCP" | "SCOTIABANK" | "NINGUNO";
type TipoMoneda = "PEN" | "USD";

const MONEDA_SIMBOLO: Record<TipoMoneda, string> = { PEN: "S/", USD: "U$" };

// "confirmada" queda afuera a propósito: esa transición solo debe pasar por el botón
// "Confirmar venta" (que además descuenta stock), nunca eligiéndola directo del select.
const ESTADOS: EstadoCotizacion[] = ["borrador", "enviada", "aceptada", "rechazada", "cancelada"];
const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  confirmada: "Confirmada (venta)",
  cancelada: "Cancelada",
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

const PRINT_AREA_ID = "cotizacion-print-area";

// 1mm = 96/25.4 px, la equivalencia estándar que usan los navegadores para CSS (a 96dpi).
const PX_POR_MM = 96 / 25.4;
const HOJA_ANCHO_MM = 210;
const HOJA_ALTO_MM = 297;
const PREVIEW_PADDING_PX = 8;

// Todo lo editable del documento vive en un solo objeto (no en useState sueltos) para
// poder deshacer/rehacer: cada cambio confirmado apila el estado anterior en `pasado` en
// vez de perderse. El cliente en el buscador (clienteQuery) y si el dropdown está abierto
// quedan afuera a propósito -son solo UI del buscador, no datos del documento en sí-.
type DocumentoCotizacion = {
  contactoId: string;
  estado: EstadoCotizacion;
  tipoDocumento: TipoDocumento;
  tipoPago: TipoPago;
  moneda: TipoMoneda;
  fecha: string;
  notas: string;
  lineas: LineaItem[];
  // "tarjetas" (armado a mano) usa `lineas` de arriba. "libre" (importado de Word) usa
  // `lineasLibres`: el contenido detectado se edita directo sobre la hoja, sin forzarlo a
  // los campos rígidos de una tarjeta -ver LineasLibres en cotizaciones/types.ts-.
  lineasModo: LineasModo;
  lineasLibres: LineasLibres;
};

const LINEAS_LIBRES_VACIAS: LineasLibres = { cantidad: "01", filas: [], total: "0.00" };

export function CotizacionForm({
  cotizacion,
  onSaved,
  onCancel,
  onDeleted,
}: {
  cotizacion?: Cotizacion;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clienteQuery, setClienteQuery] = useState(cotizacion?.contacto_nombre ?? "");
  const [clienteDropdownAbierto, setClienteDropdownAbierto] = useState(false);
  // Nombre de archivo del PDF: si se importó un Word, arranca con el nombre de ese
  // archivo; si no, queda vacío y el PDF usa el nombre automático (Cotizacion N° -
  // Cliente). No es parte del historial de deshacer/rehacer -es una preferencia de
  // exportación, no un dato del documento en sí-.
  const [nombreArchivoPdf, setNombreArchivoPdf] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [tempTipoDocumento, setTempTipoDocumento] = useState<TipoDocumento>("COTIZACIÓN");
  const [tempTipoPago, setTempTipoPago] = useState<TipoPago>("BCP");

  // documento/pasado/futuro viven juntos en UN solo estado (no en 3 useState separados):
  // deshacer/rehacer necesitan tocar los tres a la vez, y anidar un setState adentro del
  // updater de otro (como acá se hacía antes) es impuro -en React Strict Mode (Next.js en
  // desarrollo) esos updaters anidados se llegan a ejecutar dos veces y el historial se
  // corrompía. Con un solo setState por acción, cada updater es puro y no importa cuántas
  // veces Strict Mode lo invoque de prueba: el resultado siempre es el mismo.
  const [historial, setHistorial] = useState<{
    documento: DocumentoCotizacion;
    pasado: DocumentoCotizacion[];
    futuro: DocumentoCotizacion[];
  }>({
    documento: {
      contactoId: cotizacion?.contacto_id ?? "",
      estado: cotizacion?.estado ?? "borrador",
      tipoDocumento: "COTIZACIÓN",
      tipoPago: "BCP",
      moneda: cotizacion?.moneda ?? "PEN",
      fecha: cotizacion?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      notas: cotizacion?.notas ?? "",
      lineas: cotizacion?.lineas_detalle ?? [],
      lineasModo: cotizacion?.lineas_modo ?? "tarjetas",
      lineasLibres: cotizacion?.lineas_libres ?? LINEAS_LIBRES_VACIAS,
    },
    pasado: [],
    futuro: [],
  });
  const { documento, pasado, futuro } = historial;

  // Aplica un cambio al documento y lo apila en el historial (para Ctrl+Z / Ctrl+Y desde
  // el Topbar). Si el valor no cambió en realidad, no se apila un paso vacío.
  const actualizarDocumento = useCallback((cambios: Partial<DocumentoCotizacion>) => {
    setHistorial((h) => {
      const nuevo = { ...h.documento, ...cambios };
      if (JSON.stringify(h.documento) === JSON.stringify(nuevo)) return h;
      return { documento: nuevo, pasado: [...h.pasado, h.documento], futuro: [] };
    });
  }, []);

  const deshacer = useCallback(() => {
    setHistorial((h) => {
      if (h.pasado.length === 0) return h;
      const anterior = h.pasado[h.pasado.length - 1];
      return { documento: anterior, pasado: h.pasado.slice(0, -1), futuro: [...h.futuro, h.documento] };
    });
  }, []);

  const rehacer = useCallback(() => {
    setHistorial((h) => {
      if (h.futuro.length === 0) return h;
      const siguiente = h.futuro[h.futuro.length - 1];
      return { documento: siguiente, pasado: [...h.pasado, h.documento], futuro: h.futuro.slice(0, -1) };
    });
  }, []);

  const controladorUndoRedo = useMemo(
    () => ({ puedeDeshacer: pasado.length > 0, puedeRehacer: futuro.length > 0, deshacer, rehacer }),
    [pasado.length, futuro.length, deshacer, rehacer]
  );
  useRegistrarUndoRedo(controladorUndoRedo);

  const [isSaving, setIsSaving] = useState(false);
  const [isImportando, setIsImportando] = useState(false);
  const [isGenerandoPdf, setIsGenerandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const masterRef = useRef<HTMLDivElement>(null);
  const previewPageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [alturaContenidoPx, setAlturaContenidoPx] = useState(0);
  const [escala, setEscala] = useState(1);

  // Mide la hoja "maestra" (oculta, fuera de pantalla) para saber cuántas hojas A4 hacen
  // falta: si el contenido no entra en una sola página, se reparte en más, igual que Word.
  useEffect(() => {
    const el = masterRef.current;
    if (!el) return;
    const medir = () => setAlturaContenidoPx(el.offsetHeight);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Escala la previsualización para que la primera hoja entre completa tanto en el
  // ANCHO como en el ALTO visibles (la que más achique manda), así si hay lugar de sobra
  // en la pantalla no hace falta scrollear para ver la hoja entera -antes solo se ajustaba
  // al ancho y se podía pasar del alto disponible sin necesidad-. Esto es solo una vista en
  // pantalla -no tiene que respetar el tamaño físico real de una A4 (210mm=793px a 96dpi)-,
  // así que NO hay techo en 1 (100%): si hay lugar, se agranda más allá del tamaño "real"
  // para que se lea mejor. Lo que sí tiene que medir A4 de verdad es el PDF exportado, y ese
  // se arma aparte a partir de la hoja maestra (ver handleEnviarPdf), sin depender en nada
  // de esta escala en pantalla.
  useEffect(() => {
    const previewEl = previewPageRef.current;
    const pageEl = pageRef.current;
    if (!previewEl || !pageEl) return;
    const actualizarEscala = () => {
      const anchoDisponible = previewEl.clientWidth - PREVIEW_PADDING_PX * 2;
      const anchoNaturalPx = HOJA_ANCHO_MM * PX_POR_MM;
      const escalaPorAncho = anchoDisponible / anchoNaturalPx;

      const topPreviewRelativoAPage = previewEl.getBoundingClientRect().top - pageEl.getBoundingClientRect().top;
      const altoDisponible = pageEl.clientHeight - topPreviewRelativoAPage - PREVIEW_PADDING_PX * 2;
      const altoNaturalPx = HOJA_ALTO_MM * PX_POR_MM;
      const escalaPorAlto = altoDisponible / altoNaturalPx;

      setEscala(Math.min(escalaPorAncho, escalaPorAlto));
    };
    actualizarEscala();
    const ro = new ResizeObserver(actualizarEscala);
    ro.observe(previewEl);
    ro.observe(pageEl);
    return () => ro.disconnect();
  }, []);

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

  const clienteSeleccionado = contactos.find((c) => c.id === documento.contactoId);
  const total =
    documento.lineasModo === "libre"
      ? parsearMontoLibre(documento.lineasLibres.total)
      : documento.lineas.reduce((sum, linea) => sum + calcularSubtotalLinea(linea), 0);
  const fechaLegible = documento.fecha
    ? new Date(`${documento.fecha}T00:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
    : "";

  function seleccionarCliente(contacto: Contacto) {
    actualizarDocumento({ contactoId: contacto.id });
    setClienteQuery(contacto.nombre);
    setClienteDropdownAbierto(false);
  }

  // --- Helpers del modo "libre" (importado de Word): editan directo sobre la hoja. ---
  function actualizarLineasLibres(cambios: Partial<LineasLibres>) {
    actualizarDocumento({ lineasLibres: { ...documento.lineasLibres, ...cambios } });
  }

  function actualizarFilaLibre(id: string, cambios: Partial<FilaLibre>) {
    actualizarLineasLibres({
      filas: documento.lineasLibres.filas.map((f) => (f.id === id ? { ...f, ...cambios } : f)),
    });
  }

  function agregarFilaLibre() {
    actualizarLineasLibres({
      filas: [...documento.lineasLibres.filas, { id: crypto.randomUUID(), html: "", precio: "" }],
    });
  }

  function quitarFilaLibre(id: string) {
    actualizarLineasLibres({ filas: documento.lineasLibres.filas.filter((f) => f.id !== id) });
  }

  // El navegador quita el foco de la celda editable antes de que el click del botón de
  // negrita/cursiva se registre, así que se guarda la selección viva (vía selectionchange)
  // y se restaura justo antes de ejecutar el comando -si no, execCommand no tiene sobre
  // qué texto aplicarse-.
  const rangoGuardadoRef = useRef<Range | null>(null);
  useEffect(() => {
    function guardarSeleccion() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const nodo = sel.anchorNode;
      const el = nodo instanceof Element ? nodo : nodo?.parentElement;
      if (el?.closest('[contenteditable="true"]')) {
        rangoGuardadoRef.current = sel.getRangeAt(0);
      }
    }
    document.addEventListener("selectionchange", guardarSeleccion);
    return () => document.removeEventListener("selectionchange", guardarSeleccion);
  }, []);

  function aplicarFormatoLibre(comando: "bold" | "italic") {
    const seleccion = window.getSelection();
    if (seleccion && rangoGuardadoRef.current) {
      seleccion.removeAllRanges();
      seleccion.addRange(rangoGuardadoRef.current);
    }
    document.execCommand(comando);
  }

  async function handleSave() {
    if (!documento.contactoId) {
      setError("Elegí un cliente.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        contacto_id: documento.contactoId,
        estado: documento.estado,
        total,
        fecha: documento.fecha,
        notas: documento.notas,
        lineas_detalle: documento.lineas,
        moneda: documento.moneda,
        lineas_modo: documento.lineasModo,
        lineas_libres: documento.lineasLibres,
      };
      const res = await fetch(cotizacion ? `/api/cotizaciones/${cotizacion.id}` : "/api/cotizaciones", {
        method: cotizacion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la cotización.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!cotizacion) return;
    if (!window.confirm(`¿Eliminar la cotización #${cotizacion.numero}? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacion.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la cotización.");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  // Confirmar/revertir cambian el estado en el servidor (ahí es donde se descuenta o
  // devuelve el stock, ver las rutas /confirmar y /revertir) y solo reflejan el resultado
  // acá localmente -sin pasar por actualizarDocumento- porque no son ediciones del
  // usuario: no tiene sentido que Ctrl+Z "deshaga" un cambio de estado sin también
  // revertir el stock en el servidor, que es lo que sí hace el botón "Revertir venta".
  async function handleConfirmarVenta() {
    if (!cotizacion) return;
    if (!window.confirm("¿Confirmar esta cotización como venta? Esto descuenta el stock de los productos.")) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacion.id}/confirmar`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo confirmar la venta.");
      }
      setHistorial((h) => ({ ...h, documento: { ...h.documento, estado: "confirmada" } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevertirVenta() {
    if (!cotizacion) return;
    if (!window.confirm("¿Revertir esta venta? Esto devuelve el stock descontado.")) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacion.id}/revertir`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo revertir la venta.");
      }
      setHistorial((h) => ({ ...h, documento: { ...h.documento, estado: "aceptada" } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEnviarPdf() {
    const element = document.getElementById(PRINT_AREA_ID);
    if (!element) return;

    setIsGenerandoPdf(true);
    setError(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // se ignora: no bloquea la captura si las fuentes no reportan listo
        }
      }
      const imagenes = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        imagenes.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
                setTimeout(resolve, 3000);
              })
        )
      );

      // html2canvas-pro clona el documento en un iframe oculto para capturarlo: si ese
      // clon no puede reusar las hojas de estilo ya cargadas (CSS Modules), sale sin
      // estilos. Se inyecta el CSS actual como texto plano directo en el clon.
      let cssTexto = "";
      for (const hoja of Array.from(document.styleSheets)) {
        try {
          for (const regla of Array.from(hoja.cssRules)) cssTexto += regla.cssText + "\n";
        } catch {
          // hoja de otro origen (CORS): no se puede leer su cssRules, se omite.
        }
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // En modo libre, los botones de agregar/quitar fila viven arriba de la hoja para
        // poder editarla ahí mismo -pero son solo UI de edición, no parte del documento-.
        ignoreElements: (el) => el.classList.contains(styles.pdfOcultar),
        onclone: (clonedDoc) => {
          const estilo = clonedDoc.createElement("style");
          estilo.textContent = cssTexto;
          clonedDoc.head.appendChild(estilo);
        },
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0.5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nombreCliente = (clienteSeleccionado?.nombre || clienteQuery || "cotizacion")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();
      const nombreAuto = `Cotizacion${cotizacion ? ` ${cotizacion.numero}` : ""} - ${nombreCliente}`;
      const nombreBase = (nombreArchivoPdf.trim() || nombreAuto).replace(/[\\/:*?"<>|]/g, "").trim();
      pdf.save(`${nombreBase || "Cotizacion"}.pdf`);
    } catch {
      setError("No se pudo generar el PDF.");
    } finally {
      setIsGenerandoPdf(false);
    }
  }

  function handleImportarWordClick() {
    setTempTipoDocumento(documento.tipoDocumento);
    setTempTipoPago(documento.tipoPago);
    setIsImportModalOpen(true);
  }

  function confirmarImportacion() {
    actualizarDocumento({ tipoDocumento: tempTipoDocumento, tipoPago: tempTipoPago });
    setIsImportModalOpen(false);
    importInputRef.current?.click();
  }

  async function handleImportarWordFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError("Por ahora solo se pueden importar archivos .docx (Word moderno).");
      return;
    }

    setIsImportando(true);
    setError(null);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const resultado = await mammoth.convertToHtml({ arrayBuffer });
      const datos = procesarCotizacionWord(resultado.value);

      setNombreArchivoPdf(file.name.replace(/\.docx$/i, ""));
      setClienteQuery(datos.cliente);
      setClienteDropdownAbierto(true);
      const simbolo = MONEDA_SIMBOLO[documento.moneda];
      const totalDetectado = datos.total ?? datos.lineas.reduce((s, l) => s + l.precio, 0);
      // Un Word importado no se mapea al sistema de tarjetas (Producto/Descripción): ese
      // molde es para armar una cotización a mano, y forzar ahí un documento ajeno termina
      // mezclando datos que no corresponden (ver conversación). En vez de eso pasa a modo
      // "libre": cada línea detectada queda como una fila de texto editable directo sobre
      // la hoja, igual que en Ecosistema-Document.
      actualizarDocumento({
        contactoId: "",
        ...(datos.fecha ? { fecha: datos.fecha } : {}),
        lineasModo: "libre",
        lineasLibres: {
          cantidad: "01",
          filas: datos.lineas.map((linea) => ({
            id: crypto.randomUUID(),
            html: linea.descripcion,
            precio: linea.precio ? `${simbolo} ${linea.precio.toFixed(2)}` : "",
          })),
          total: `${simbolo} ${totalDetectado.toFixed(2)}`,
        },
      });
    } catch {
      setError("No se pudo leer el archivo Word.");
    } finally {
      setIsImportando(false);
    }
  }

  // Arma las filas <tr> de una tarjeta para la tabla de la hoja/PDF. Una tarjeta
  // "descripcion" es una sola fila (sin cantidad, precio directo). Una tarjeta "producto"
  // aporta UNA sola fila para toda la tarjeta: las cantidades, descripciones y precios de
  // cada producto van apilados dentro de la misma celda (uno por línea, alineados entre
  // columnas para que la cantidad quede a la altura de su producto). El Precio general (si
  // está cargado) se muestra en la misma línea del encabezado -no en una fila aparte-, pero
  // NO oculta los precios individuales de cada producto: todos los precios cargados se ven
  // siempre en el documento, aunque para el cálculo del total de la tarjeta el Precio
  // general siga siendo el que manda (ver calcularSubtotalLinea). Las marcas de negrita son
  // manuales (el usuario decide qué producto o precio resaltar); el encabezado siempre sale
  // en negrita porque ya cumple ese rol por diseño.
  function renderFilasCarta(carta: LineaItem) {
    if (carta.tipo === "descripcion") {
      return [
        <tr key={carta.id}>
          <td></td>
          <td className={carta.negritaDescripcion ? styles.sheetTextoNegrita : undefined}>
            {carta.descripcion || "—"}
          </td>
          <td className={carta.negritaPrecio ? styles.sheetTextoNegrita : undefined}>
            {carta.precio ? `${MONEDA_SIMBOLO[documento.moneda]} ${carta.precio.toFixed(2)}` : ""}
          </td>
        </tr>,
      ];
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
                    {tienePrecioGeneral ? `${MONEDA_SIMBOLO[documento.moneda]} ${(carta.precio_general as number).toFixed(2)}` : ""}
                  </td>
                </tr>
              )}
              {carta.productos.map((p) => {
                const productoCatalogo = productos.find((prod) => prod.id === p.producto_id);
                return (
                  <tr key={p.id}>
                    <td>{p.cantidad || ""}</td>
                    <td className={p.negritaDescripcion ? styles.sheetTextoNegrita : undefined}>
                      {productoCatalogo?.nombre ?? p.descripcion ?? "—"}
                    </td>
                    <td className={p.negritaPrecio ? styles.sheetTextoNegrita : undefined}>
                      {p.precio_unitario ? `${MONEDA_SIMBOLO[documento.moneda]} ${(p.cantidad * p.precio_unitario).toFixed(2)}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </td>
      </tr>,
    ];
  }

  // Contenido de una hoja: se renderiza una vez en la hoja maestra oculta (para medir
  // altura real y capturar el PDF) y una vez por cada hoja visible en la previsualización
  // (recortada con un desplazamiento distinto), así que vive en una función y no inline.
  function renderContenidoHoja() {
    return (
      <>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetEmpresa}>
            <Image src={logo} alt={EMPRESA.nombre} className={styles.sheetLogo} />
            <p className={styles.sheetEmpresaNombre}>{EMPRESA.nombre}</p>
            <p className={styles.sheetEmpresaDato}>{EMPRESA.direccion}</p>
            <p className={styles.sheetEmpresaDato}>TELF: {EMPRESA.telefonos}</p>
            <p className={styles.sheetEmpresaEmail}>e-mail: {EMPRESA.email}</p>
          </div>
          <div className={styles.sheetDocBox}>
            <div className={styles.sheetRucBox}>R.U.C. N° {EMPRESA.ruc}</div>
            <div className={styles.sheetTituloBox}>{documento.tipoDocumento}</div>
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
          </tbody>
        </table>

        {documento.lineasModo === "libre" ? (
          documento.lineasLibres.filas.length > 0 ? (
            <table className={styles.sheetTable}>
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {documento.lineasLibres.filas.map((fila, index) => (
                  <tr key={fila.id}>
                    {index === 0 && (
                      <td rowSpan={documento.lineasLibres.filas.length}>
                        <CeldaEditable
                          className={styles.sheetCeldaEditable}
                          html={documento.lineasLibres.cantidad}
                          onCommit={(html) => actualizarLineasLibres({ cantidad: html })}
                        />
                      </td>
                    )}
                    <td>
                      <div className={styles.sheetFilaLibreWrap}>
                        <CeldaEditable
                          className={styles.sheetCeldaEditable}
                          html={fila.html}
                          onCommit={(html) => actualizarFilaLibre(fila.id, { html })}
                        />
                        <button
                          type="button"
                          className={`${styles.filaLibreQuitar} ${styles.pdfOcultar}`}
                          onClick={() => quitarFilaLibre(fila.id)}
                          aria-label="Quitar fila"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <CeldaEditable
                        className={styles.sheetCeldaEditable}
                        html={fila.precio}
                        onCommit={(html) => actualizarFilaLibre(fila.id, { precio: html })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.sheetEmpty}>Todavía no hay filas.</p>
          )
        ) : documento.lineas.length > 0 ? (
          <table className={styles.sheetTable}>
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>{documento.lineas.map((linea) => renderFilasCarta(linea))}</tbody>
          </table>
        ) : (
          <p className={styles.sheetEmpty}>Todavía no agregaste productos.</p>
        )}

        {documento.lineasModo === "libre" && (
          <button type="button" className={`${styles.agregarFilaLibre} ${styles.pdfOcultar}`} onClick={agregarFilaLibre}>
            <Plus size={13} />
            Agregar fila
          </button>
        )}

        <div className={styles.sheetTotalWrap}>
          <table className={styles.sheetTotalTable}>
            <tbody>
              <tr>
                <td>TOTAL</td>
                <td>
                  {documento.lineasModo === "libre" ? (
                    <CeldaEditable
                      className={styles.sheetCeldaEditable}
                      html={documento.lineasLibres.total}
                      onCommit={(html) => actualizarLineasLibres({ total: html })}
                    />
                  ) : (
                    `${MONEDA_SIMBOLO[documento.moneda]} ${total.toFixed(2)}`
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {documento.notas && <p className={styles.sheetNotas}>{documento.notas}</p>}

        <div className={styles.sheetBottom}>
          {documento.tipoPago !== "NINGUNO" && (
            <div className={styles.sheetCuenta}>
              {documento.tipoPago === "BCP" ? (
                <>
                  <p>{EMPRESA.cuenta.titulo}</p>
                  <p>BCP SOLES: {EMPRESA.cuenta.soles}</p>
                  <p>CCI: {EMPRESA.cuenta.cci}</p>
                  <p>NOMBRE: {EMPRESA.cuenta.nombre}</p>
                </>
              ) : (
                <>
                  <p>CUENTA DE AHORRO DÓLARES SCOTIABANK</p>
                  <p>DÓLARES: 149-0042206</p>
                  <p>CCI: 009-087-211490042206-81</p>
                </>
              )}
            </div>
          )}

          <div className={styles.sheetFooter}>
            <p>DOCUMENTO SUJETO A VERIFICACIÓN Y APROBACIÓN FINAL.</p>
            <p className={styles.sheetFooterStrong}>&quot;GRACIAS POR SU PREFERENCIA&quot;</p>
          </div>
        </div>
      </>
    );
  }

  const alturaPaginaPx = HOJA_ALTO_MM * PX_POR_MM;
  // Resta unos px de tolerancia antes de redondear hacia arriba: offsetHeight (entero) y
  // esta cuenta en mm→px (con decimales) casi nunca coinciden exacto, y sin esto una hoja
  // que mide justo una página de alto podía redondear a 2 por un subpíxel de diferencia.
  const numPaginas = Math.max(1, Math.ceil((alturaContenidoPx - 3) / alturaPaginaPx));

  const actions: ModuleAction[] = [
    { key: "guardar", icon: Save, label: "Guardar y cerrar", onClick: handleSave, disabled: isSaving, tone: "primary" },
    ...(cotizacion
      ? [{ key: "eliminar", icon: Trash2, label: "Eliminar", onClick: handleDelete, disabled: isSaving, tone: "danger" as const }]
      : []),
    { key: "enviar-pdf", icon: Printer, label: "Enviar PDF", onClick: handleEnviarPdf, disabled: isGenerandoPdf },
    ...(!cotizacion
      ? [{ key: "importar-word", icon: Upload, label: "Importar Word", onClick: handleImportarWordClick, disabled: isImportando }]
      : []),
    ...(documento.lineasModo === "libre"
      ? [
          { key: "negrita", icon: Bold, label: "Negrita", onClick: () => aplicarFormatoLibre("bold") },
          { key: "cursiva", icon: Italic, label: "Cursiva", onClick: () => aplicarFormatoLibre("italic") },
        ]
      : []),
    ...(cotizacion
      ? [
          documento.estado === "confirmada"
            ? { key: "revertir-venta", icon: RotateCcw, label: "Revertir venta", onClick: handleRevertirVenta, disabled: isSaving }
            : { key: "confirmar-venta", icon: CheckCircle2, label: "Confirmar venta", onClick: handleConfirmarVenta, disabled: isSaving },
        ]
      : []),
    { key: "cerrar", icon: XCircle, label: "Cerrar cotización", onClick: onCancel },
  ];

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <ActionsDrawer actions={actions} />
      <input
        ref={importInputRef}
        type="file"
        accept=".docx"
        onChange={handleImportarWordFile}
        style={{ display: "none" }}
      />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      {isImportModalOpen && (
        <FloatingWindow title="Opciones de Importación" onClose={() => setIsImportModalOpen(false)} width={400}>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Tipo de Documento</span>
              <select
                className={fieldStyles.select}
                value={tempTipoDocumento}
                onChange={(e) => setTempTipoDocumento(e.target.value as TipoDocumento)}
              >
                <option value="COTIZACIÓN">Cotización</option>
                <option value="LIQUIDACIÓN DE SERVICIO">Liquidación de Servicio</option>
              </select>
            </label>

            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Cuenta Bancaria</span>
              <select
                className={fieldStyles.select}
                value={tempTipoPago}
                onChange={(e) => setTempTipoPago(e.target.value as TipoPago)}
              >
                <option value="BCP">BCP (Soles)</option>
                <option value="SCOTIABANK">Scotiabank (Dólares)</option>
                <option value="NINGUNO">Ninguno</option>
              </select>
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                style={{ padding: "8px 16px", borderRadius: "var(--radius, 4px)", border: "1px solid var(--border-color, #ccc)", background: "transparent", color: "var(--text-primary, black)", cursor: "pointer", fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarImportacion}
                style={{ padding: "8px 16px", borderRadius: "var(--radius, 4px)", border: "none", background: "var(--eco-celeste, #0066cc)", color: "white", cursor: "pointer", fontWeight: 600 }}
              >
                Continuar
              </button>
            </div>
          </div>
        </FloatingWindow>
      )}

      <div className={styles.page} ref={pageRef}>
        <div className={styles.layout}>
          {/* Editor */}
          <div className={styles.editor}>
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
                      actualizarDocumento({ contactoId: "" });
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
                  value={documento.estado}
                  disabled={documento.estado === "confirmada"}
                  title={documento.estado === "confirmada" ? 'Usá "Revertir venta" para poder cambiarlo.' : undefined}
                  onChange={(e) => actualizarDocumento({ estado: e.target.value as EstadoCotizacion })}
                >
                  {documento.estado === "confirmada" && (
                    <option value="confirmada">{ESTADO_LABEL.confirmada}</option>
                  )}
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
                  value={documento.fecha}
                  onChange={(e) => actualizarDocumento({ fecha: e.target.value })}
                />
              </label>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Tipo de Documento</span>
                <select
                  className={fieldStyles.select}
                  value={documento.tipoDocumento}
                  onChange={(e) => actualizarDocumento({ tipoDocumento: e.target.value as TipoDocumento })}
                >
                  <option value="COTIZACIÓN">Cotización</option>
                  <option value="LIQUIDACIÓN DE SERVICIO">Liquidación de Servicio</option>
                </select>
              </label>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Cuenta Bancaria</span>
                <select
                  className={fieldStyles.select}
                  value={documento.tipoPago}
                  onChange={(e) => actualizarDocumento({ tipoPago: e.target.value as TipoPago })}
                >
                  <option value="BCP">BCP (Soles)</option>
                  <option value="SCOTIABANK">Scotiabank (Dólares)</option>
                  <option value="NINGUNO">Ninguno</option>
                </select>
              </label>
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Moneda</span>
                <select
                  className={fieldStyles.select}
                  value={documento.moneda}
                  onChange={(e) => actualizarDocumento({ moneda: e.target.value as TipoMoneda })}
                >
                  <option value="PEN">Soles (S/)</option>
                  <option value="USD">Dólares (U$)</option>
                </select>
              </label>
            </div>

            <p className={fieldStyles.sectionTitle}>Productos</p>
            {documento.lineasModo === "libre" ? (
              <p className={styles.avisoLibre}>
                Este documento se importó de Word: editá el contenido haciendo clic directo sobre la hoja de la
                derecha →
              </p>
            ) : (
              <LineaItemsEditor value={documento.lineas} onChange={(lineas) => actualizarDocumento({ lineas })} />
            )}

            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Notas</span>
              <textarea
                className={fieldStyles.textarea}
                value={documento.notas}
                onChange={(e) => actualizarDocumento({ notas: e.target.value })}
              />
            </label>

            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Nombre del archivo (PDF)</span>
              <input
                type="text"
                className={fieldStyles.input}
                placeholder={`Cotizacion${cotizacion ? ` ${cotizacion.numero}` : ""} - ${clienteSeleccionado?.nombre || clienteQuery || "cliente"}`}
                value={nombreArchivoPdf}
                onChange={(e) => setNombreArchivoPdf(e.target.value)}
              />
            </label>
          </div>

          {/* Previsualización */}
          <div className={styles.preview}>
            <p className={styles.previewLabel}>
              Previsualización{numPaginas > 1 ? ` — ${numPaginas} hojas` : ""}
            </p>
            <div className={styles.previewPage} ref={previewPageRef}>
              {/* "zoom" (no estándar, pero sí soportado en Chromium/Electron, el motor de
                  esta app) en vez de "transform: scale": a diferencia de transform, zoom
                  SÍ reduce el espacio de layout que ocupa el elemento, así el contenedor
                  no termina necesitando scroll por el tamaño "de verdad" sin escalar. */}
              <div className={styles.pageStack} style={{ zoom: escala }}>
                {Array.from({ length: numPaginas }).map((_, index) => (
                  <div key={index} className={styles.pageFrame}>
                    <div
                      className={`${styles.sheet} ${styles.pageContent}`}
                      style={{ top: -(index * alturaPaginaPx) }}
                    >
                      {renderContenidoHoja()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hoja maestra: no se ve (fuera de pantalla), pero mide la altura real del
                contenido y es la que se captura para el PDF (ver handleEnviarPdf). */}
            <div
              ref={masterRef}
              id={PRINT_AREA_ID}
              className={styles.sheet}
              style={{ position: "absolute", top: 0, left: -99999 }}
            >
              {renderContenidoHoja()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
