"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Save, CheckCircle2, Trash2, Plus, Upload, FileText, ChevronLeft, ShoppingCart, Truck, Package, StickyNote, RotateCcw } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { WidgetCard } from "@/components/ui/WidgetCard";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Producto } from "@/components/inventario/types";
import type { Proveedor } from "@/components/proveedores/types";
import type { Entrada, EntradaLinea, Almacen } from "@/components/movimientos/types";
import type { ComprasVista } from "..";
import { extraerTextoPdf, parsearFacturaPdf } from "../importarFacturaPdf";
import { ProductoSelector } from "@/components/ui/ProductoSelector";
import { DevolverModal } from "./DevolverModal";
import { useRegistrarUndoRedo } from "@/components/undoRedo/UndoRedoProvider";
import styles from "./EntradaForm.module.css";

// Tasa de IGV en Perú: la columna "con IGV" es solo informativa (para comparar contra
// la previsualización del PDF) -- lo que se guarda en la base siempre es sin IGV, como
// ya documenta EntradaLinea en movimientos/types.ts.
const IGV = 0.18;

type LineaEditable = {
  // Vacío hasta que se elige un producto YA existente del catálogo, o se acepta uno
  // nuevo (ver productoPendiente). Nunca se crea un producto solo, sin que el usuario lo
  // vea y lo acepte explícitamente -cada proveedor nombra el mismo producto distinto, y
  // dar de alta automático por descripción terminaba duplicando el catálogo.
  producto_id: string;
  // Ya no se elige a mano (solo hay un almacén): se completa solo con el único que
  // devuelve /api/almacenes y no se muestra en la tabla.
  almacen_id: string;
  cantidad: number;
  costo_unitario: number;
  // Nombre/código tal como figura en la factura importada -se muestra en gris como
  // sugerencia dentro del campo mientras está vacío (Tab la acepta), nunca se asume sola.
  descripcionFactura?: { nombre: string; codigo: string | null };
  // Se llena recién cuando el usuario acepta explícitamente (Tab sobre la sugerencia
  // fantasma, o tipeando un nombre que no matchea ningún producto del catálogo) que una
  // línea es un producto nuevo: queda editable en la misma línea y recién se da de alta
  // como Producto real al guardar la compra, nunca antes.
  productoPendiente?: { nombre: string; codigo: string | null };
};

function lineaVacia(almacenId: string): LineaEditable {
  return { producto_id: "", almacen_id: almacenId, cantidad: 1, costo_unitario: 0 };
}

function slugSku(texto: string): string {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  return base || "PROD";
}

// Da de alta un producto que el usuario aceptó explícitamente como nuevo (ver
// productoPendiente) -- el código de la factura (si se detectó) se usa como SKU; si no,
// se genera uno a partir del nombre más un sufijo al azar para no chocar con el UNIQUE de
// sku.
async function crearProductoAutomatico(l: {
  descripcion: string;
  codigo: string | null;
  costo_unitario: number;
}): Promise<Producto | null> {
  const sku = l.codigo || `${slugSku(l.descripcion)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  try {
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: l.descripcion,
        sku,
        stock: 0,
        precio: 0,
        favorito: false,
        foto_url: null,
        limite_stock: 0,
        tipo: "bienes",
        rastrear_inventario: true,
        unidad: "Unidad",
        impuesto_venta: null,
        codigo_detraccion: null,
        costo: l.costo_unitario,
        categoria: null,
        referencia: null,
        codigo_barras: null,
        notas_internas: null,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Todo lo editable de la compra vive en un solo objeto (no en useState sueltos) para
// poder deshacer/rehacer -mismo patrón que CotizacionForm-: cada cambio confirmado apila
// el estado anterior en `pasado`. `proveedorQuery` (el texto del buscador) queda afuera a
// propósito, igual que clienteQuery en Cotizaciones: es solo UI del buscador, no un dato
// de la compra en sí.
type DocumentoCompra = {
  proveedorId: string;
  numeroFactura: string;
  fecha: string;
  moneda: "PEN" | "USD";
  notas: string;
  lineas: LineaEditable[];
};

// Persiste el PDF importado en el filesystem local (ver /api/uploads/factura) para poder
// volver a verlo al reabrir la compra más adelante -antes solo vivía como blob URL en el
// navegador y se perdía al recargar la página. Si la subida falla, no se corta el
// autocompletado del resto de los campos: solo no queda vista previa guardada.
async function subirFacturaPdf(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads/factura", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export function EntradaForm({
  entrada,
  vista,
  onCambiarVista,
  onCancel,
  onSaved,
  onDeleted,
}: {
  entrada?: Entrada;
  vista?: ComprasVista;
  onCambiarVista?: (vista: ComprasVista) => void;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  const [proveedorQuery, setProveedorQuery] = useState(entrada?.proveedor_nombre ?? "");
  const [proveedorDropdownAbierto, setProveedorDropdownAbierto] = useState(false);
  const [isCreandoProveedor, setIsCreandoProveedor] = useState(false);
  // RUC opcional para el alta rápida de proveedor -sin esto, un proveedor creado a mano
  // acá y otro creado después al importar un PDF de la misma empresa (que sí trae RUC)
  // terminaban siendo dos registros distintos para el mismo proveedor real: el índice
  // único de la base solo puede evitar duplicados por RUC si el RUC está cargado.
  const [rucNuevoProveedor, setRucNuevoProveedor] = useState("");
  // Lo que se detecta al importar un PDF (proveedor nuevo por dar de alta, o nombre
  // desactualizado de uno ya existente) NO se escribe en la base ahí mismo -solo importar
  // un PDF no puede generar cambios persistentes-: queda acá pendiente y recién se aplica
  // al guardar la compra de verdad (ver guardar()), mismo criterio que productoPendiente.
  const [proveedorPendiente, setProveedorPendiente] = useState<
    | { modo: "crear"; nombre: string; ruc: string | null }
    | { modo: "sincronizar"; proveedor: Proveedor; nombreNuevo: string }
    | null
  >(null);

  // documento/pasado/futuro viven juntos en UN solo estado (no en useState sueltos):
  // deshacer/rehacer necesitan tocar varios campos a la vez, y un solo setState por acción
  // evita que React Strict Mode corrompa el historial invocando updaters anidados dos
  // veces -mismo patrón que CotizacionForm-.
  const [historial, setHistorial] = useState<{
    documento: DocumentoCompra;
    pasado: DocumentoCompra[];
    futuro: DocumentoCompra[];
  }>({
    documento: {
      proveedorId: entrada?.proveedor_id ?? "",
      numeroFactura: entrada?.numero_factura_proveedor ?? "",
      fecha: entrada?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      moneda: entrada?.moneda ?? "PEN",
      notas: entrada?.notas ?? "",
      lineas:
        entrada?.lineas?.map((l) => ({
          producto_id: l.producto_id,
          almacen_id: l.almacen_id,
          cantidad: Number(l.cantidad),
          costo_unitario: Number(l.costo_unitario),
        })) ?? [],
    },
    pasado: [],
    futuro: [],
  });
  const { documento, pasado, futuro } = historial;
  const { proveedorId, numeroFactura, fecha, moneda, notas, lineas } = documento;

  // Aplica un cambio a la compra y lo apila en el historial (para Ctrl+Z / Ctrl+Y desde el
  // Topbar). Si el valor no cambió en realidad, no se apila un paso vacío.
  const actualizarDocumento = useCallback((cambios: Partial<DocumentoCompra>) => {
    setHistorial((h) => {
      const nuevo = { ...h.documento, ...cambios };
      if (JSON.stringify(h.documento) === JSON.stringify(nuevo)) return h;
      return { documento: nuevo, pasado: [...h.pasado, h.documento], futuro: [] };
    });
  }, []);

  // El alta de productos pendientes justo antes de guardar (ver guardar()) actualiza el
  // documento sin apilar un paso de deshacer, para no ofrecer un "Ctrl+Z" que vuelva a un
  // estado a medio armar que el usuario nunca tipeó.
  const actualizarDocumentoSinHistorial = useCallback((cambios: Partial<DocumentoCompra>) => {
    setHistorial((h) => ({ ...h, documento: { ...h.documento, ...cambios } }));
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

  const [entradaId, setEntradaId] = useState(entrada?.id);
  const [estado, setEstado] = useState(entrada?.estado ?? "borrador");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Líneas con su `cantidad_disponible` (cantidad - lo ya devuelto) para decidir si
  // todavía queda algo para devolver. `entrada.lineas` ya viene con eso calculado cuando
  // se abre una compra existente desde el listado -alcanza como valor inicial-, pero si
  // la compra se confirma en esta misma sesión (sin recargar la página) todavía no hay
  // ids de línea locales para eso: por eso se vuelve a pedir al servidor justo después de
  // confirmar o de devolver, en vez de un useEffect atado a `estado` (que también se
  // actualiza acá adentro y termina disparándose a sí mismo).
  const [lineasDisponibles, setLineasDisponibles] = useState<EntradaLinea[]>(entrada?.lineas ?? []);
  const [mostrandoDevolucion, setMostrandoDevolucion] = useState(false);

  const refrescarEstadoYLineas = useCallback(async (id: string) => {
    const res = await fetch(`/api/entradas/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setLineasDisponibles(data.lineas ?? []);
    setEstado(data.estado);
  }, []);

  // --- Importar factura en PDF: la previsualización va al costado del formulario (o
  // reemplaza a "Líneas de productos" si no hay PDF, ver el layout más abajo), y lo que se
  // logra detectar en el texto del PDF completa los campos solo (mejor esfuerzo). El PDF
  // se sube a /api/uploads/factura para poder volver a verlo al reabrir la compra --
  // pdfPreviewUrl arranca con la URL ya persistida si esta entrada ya tenía una. ---
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(entrada?.factura_pdf_url ?? null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [facturaPdfUrl, setFacturaPdfUrl] = useState<string | null>(entrada?.factura_pdf_url ?? null);
  const [isImportandoPdf, setIsImportandoPdf] = useState(false);
  const [proveedorDetectadoHint, setProveedorDetectadoHint] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const tienePdf = Boolean(pdfPreviewUrl);

  useEffect(() => {
    fetch("/api/productos").then((r) => (r.ok ? r.json() : [])).then(setProductos).catch(() => setProductos([]));
    fetch("/api/proveedores").then((r) => (r.ok ? r.json() : [])).then(setProveedores).catch(() => setProveedores([]));
    fetch("/api/almacenes").then((r) => (r.ok ? r.json() : [])).then((data: Almacen[]) => {
      setAlmacenes(data);
      if (!entrada && data.length > 0) {
        setHistorial((h) => (h.documento.lineas.length > 0 ? h : { ...h, documento: { ...h.documento, lineas: [lineaVacia(data[0].id)] } }));
      }
    }).catch(() => setAlmacenes([]));
  }, [entrada]);

  // El blob URL de la previsualización no se libera solo: hay que revocarlo al reemplazar
  // el PDF importado o al cerrar el formulario, si no la memoria del navegador se acumula.
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfPreviewUrl]);

  const proveedoresFiltrados = useMemo(() => {
    const termino = proveedorQuery.trim().toLowerCase();
    if (!termino) return proveedores;
    return proveedores.filter((p) => p.nombre.toLowerCase().includes(termino));
  }, [proveedores, proveedorQuery]);

  const hayCoincidenciaExacta = proveedores.some(
    (p) => p.nombre.trim().toLowerCase() === proveedorQuery.trim().toLowerCase()
  );

  function seleccionarProveedor(proveedor: Proveedor) {
    actualizarDocumento({ proveedorId: proveedor.id });
    setProveedorQuery(proveedor.nombre);
    setProveedorDetectadoHint(null);
    setProveedorDropdownAbierto(false);
    setRucNuevoProveedor("");
    setProveedorPendiente(null);
  }

  // El desplegable ahora tiene dos campos enfocables (el buscador y el RUC del alta
  // rápida): sin este chequeo, pasar el foco de uno al otro con un clic disparaba el
  // onBlur del primero y cerraba el desplegable a mitad de tipear el RUC.
  const proveedorDropdownRef = useRef<HTMLDivElement>(null);
  function onBlurAreaProveedor(e: React.FocusEvent) {
    if (proveedorDropdownRef.current?.contains(e.relatedTarget as Node)) return;
    setTimeout(() => setProveedorDropdownAbierto(false), 150);
  }

  // Escribir un nombre nuevo NO lo da de alta solo: hace falta este paso explícito
  // (clic en "Crear proveedor…") para que quede registrado en el sistema. Así lo
  // tipeado a mano nunca entra como proveedor real sin que el usuario lo pida.
  async function crearProveedorDesdeQuery() {
    const nombre = proveedorQuery.trim();
    if (!nombre || isCreandoProveedor) return;

    const rucLimpio = rucNuevoProveedor.trim();
    // Si ya existe un proveedor con ese RUC en la lista cargada, es el mismo proveedor
    // real -se selecciona en vez de mandar otro alta (que igual convergería al mismo
    // registro por el UPSERT del servidor, pero así se evita el viaje de red de más).
    if (rucLimpio) {
      const existentePorRuc = proveedores.find((p) => p.ruc && p.ruc.replace(/\D/g, "") === rucLimpio.replace(/\D/g, ""));
      if (existentePorRuc) {
        seleccionarProveedor(existentePorRuc);
        setRucNuevoProveedor("");
        return;
      }
    }

    setIsCreandoProveedor(true);
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, ruc: rucLimpio || null }),
      });
      if (!res.ok) throw new Error();
      const proveedorGuardado: Proveedor = await res.json();
      // Por RUC repetido el servidor hace UPSERT y devuelve el registro YA existente (con
      // el nombre actualizado): reemplaza esa entrada en vez de duplicarla en la lista.
      setProveedores((prev) =>
        prev.some((p) => p.id === proveedorGuardado.id)
          ? prev.map((p) => (p.id === proveedorGuardado.id ? proveedorGuardado : p))
          : [...prev, proveedorGuardado]
      );
      seleccionarProveedor(proveedorGuardado);
      setRucNuevoProveedor("");
    } catch {
      setError("No se pudo crear el proveedor.");
    } finally {
      setIsCreandoProveedor(false);
    }
  }

  function actualizarLinea(index: number, patch: Partial<LineaEditable>) {
    actualizarDocumento({
      lineas: lineas.map((l, i) => (i === index ? { ...l, ...patch, productoPendiente: patch.producto_id ? undefined : l.productoPendiente } : l)),
    });
  }

  // El nombre pendiente se puede corregir a mano (ej. sacar una letra de más) sin que eso
  // dispare ninguna alta en el catálogo -recién se crea el Producto real al guardar la
  // compra, ver guardar(). `codigo` solo viene informado cuando se aceptó tal cual la
  // sugerencia fantasma de la factura (con Tab); si el usuario tipea a mano, se conserva
  // el código ya detectado (si había) en vez de perderlo.
  function actualizarNombrePendiente(index: number, nombre: string, codigo?: string | null) {
    actualizarDocumento({
      lineas: lineas.map((l, i) => {
        if (i !== index || l.producto_id) return l;
        if (!nombre) return { ...l, productoPendiente: undefined };
        return { ...l, productoPendiente: { nombre, codigo: codigo ?? l.productoPendiente?.codigo ?? l.descripcionFactura?.codigo ?? null } };
      }),
    });
  }

  function agregarLinea() {
    actualizarDocumento({ lineas: [...lineas, lineaVacia(almacenes[0]?.id ?? "")] });
  }

  function quitarLinea(index: number) {
    actualizarDocumento({ lineas: lineas.filter((_, i) => i !== index) });
  }

  const total = lineas.reduce((sum, l) => sum + l.cantidad * l.costo_unitario, 0);
  const puedeEditar = estado === "borrador";
  const simboloMoneda = moneda === "USD" ? "US$" : "S/";

  function validar(): string | null {
    // O ya hay un proveedor elegido, o quedó uno pendiente por crear/sincronizar al
    // importar el PDF (ver handleImportarFacturaFile) -eso se resuelve recién en
    // guardar(), nunca antes.
    if (!proveedorId && !proveedorPendiente) return "Elegí un proveedor.";
    if (lineas.length === 0) return "Agregá al menos una línea.";
    for (const l of lineas) {
      // O ya existe en el catálogo, o el usuario aceptó explícitamente que es un
      // producto nuevo (productoPendiente) -nunca queda una línea completamente vacía.
      if (!l.producto_id && !l.productoPendiente?.nombre.trim()) return "Todas las líneas necesitan un producto -elegí uno de Stock, o aceptá/escribí uno nuevo.";
      // Si no hay almacén asignado pero existe uno disponible, usar el primero automáticamente
      if (!l.almacen_id && almacenes.length > 0) {
        // Esto no debería pasar normalmente, pero por seguridad validamos
        continue;
      }
      if (!l.almacen_id) return "No se encontró el almacén (revisá que exista al menos uno registrado).";
      if (l.cantidad <= 0) return "La cantidad tiene que ser mayor a 0.";
    }
    return null;
  }

  async function guardar(): Promise<string | null> {
    const validacion = validar();
    if (validacion) {
      setError(validacion);
      return null;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Recién acá -al guardar la compra de verdad, no al importar el PDF- se resuelve el
      // proveedor que quedó pendiente: se crea si era nuevo, o se sincroniza el nombre si
      // ya existía pero la factura traía uno distinto. Así el usuario tuvo toda la
      // oportunidad de corregirlo antes de que quede grabado en la base.
      let proveedorIdFinal = proveedorId;
      if (proveedorPendiente?.modo === "crear" && !proveedorIdFinal) {
        const res = await fetch("/api/proveedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: proveedorPendiente.nombre, ruc: proveedorPendiente.ruc }),
        });
        if (!res.ok) {
          setError(`No se pudo crear el proveedor "${proveedorPendiente.nombre}".`);
          setIsSaving(false);
          return null;
        }
        const nuevoProveedor: Proveedor = await res.json();
        setProveedores((prev) => [...prev, nuevoProveedor]);
        proveedorIdFinal = nuevoProveedor.id;
      } else if (proveedorPendiente?.modo === "sincronizar") {
        try {
          const res = await fetch(`/api/proveedores/${proveedorPendiente.proveedor.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...proveedorPendiente.proveedor, nombre: proveedorPendiente.nombreNuevo }),
          });
          if (res.ok) {
            const actualizado: Proveedor = await res.json();
            setProveedores((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
          }
        } catch {
          // Si falla la sincronización del nombre no se corta el guardado de la compra.
        }
      }
      setProveedorPendiente(null);

      // Recién acá también se dan de alta en el catálogo los productos que quedaron
      // pendientes: mismo criterio que el proveedor, nunca antes de guardar de verdad.
      let lineasAGuardar = lineas;
      const almacenDefecto = almacenes[0]?.id;
      if (almacenDefecto) {
        lineasAGuardar = lineasAGuardar.map(l => ({
          ...l,
          almacen_id: l.almacen_id || almacenDefecto
        }));
      }
      if (lineas.some((l) => !l.producto_id && l.productoPendiente?.nombre.trim())) {
        const resueltas: LineaEditable[] = [];
        const productosCreados: Producto[] = [];
        for (const l of lineasAGuardar) {
          if (l.producto_id || !l.productoPendiente?.nombre.trim()) {
            resueltas.push(l);
            continue;
          }
          const creado = await crearProductoAutomatico({
            descripcion: l.productoPendiente.nombre.trim(),
            codigo: l.productoPendiente.codigo,
            costo_unitario: l.costo_unitario,
          });
          if (!creado) {
            setError(`No se pudo crear el producto "${l.productoPendiente.nombre}".`);
            setIsSaving(false);
            return null;
          }
          productosCreados.push(creado);
          resueltas.push({ producto_id: creado.id, almacen_id: l.almacen_id, cantidad: l.cantidad, costo_unitario: l.costo_unitario });
        }
        lineasAGuardar = resueltas;
        setProductos((prev) => [...prev, ...productosCreados]);
        actualizarDocumentoSinHistorial({ lineas: resueltas });
      }

      const payload = {
        proveedor_id: proveedorIdFinal,
        numero_factura_proveedor: numeroFactura || null,
        fecha,
        moneda,
        notas: notas || null,
        factura_pdf_url: facturaPdfUrl,
        lineas: lineasAGuardar.map((l) => ({
          producto_id: l.producto_id,
          almacen_id: l.almacen_id,
          cantidad: l.cantidad,
          costo_unitario: l.costo_unitario,
          subtotal: l.cantidad * l.costo_unitario,
          fecha_vencimiento: null,
        })),
      };

      const res = await fetch(entradaId ? `/api/entradas/${entradaId}` : "/api/entradas", {
        method: entradaId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la compra.");
      const data = await res.json();
      const id = entradaId ?? data.id;
      setEntradaId(id);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGuardar() {
    if (await guardar()) onSaved();
  }

  async function handleConfirmar() {
    const id = await guardar();
    if (!id) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/entradas/${id}/confirmar`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo confirmar la compra.");
      }
      setEstado("confirmada");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEliminar() {
    if (!entradaId) return onCancel();
    // Para un borrador (nunca tocó stock) el aviso es simple. Para una compra ya
    // devuelta al 100% -único otro caso en que este botón queda habilitado- hay que
    // dejar clarísimo qué se va a borrar de verdad: los productos y el lote que entraron
    // ya se revirtieron al devolver, así que esto borra el papeleo (la compra y su nota
    // de crédito), como si nunca se hubiera registrado.
    const advertencia =
      estado === "borrador"
        ? "¿Eliminar este borrador de compra? Esta acción no se puede deshacer."
        : "¿Eliminar definitivamente esta compra?\n\nLos productos y el lote que ingresó ya se revirtieron al devolverla -esto borra la compra y su nota de crédito, como si nunca la hubieras registrado. Esta acción no se puede deshacer.";
    if (!window.confirm(advertencia)) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/entradas/${entradaId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la compra.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  function handleImportarFacturaClick() {
    importInputRef.current?.click();
  }

  async function handleImportarFacturaFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(URL.createObjectURL(file));
    setPdfFileName(file.name);
    setFacturaPdfUrl(null);
    setProveedorDetectadoHint(null);
    setIsImportandoPdf(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const [texto, urlPersistida] = await Promise.all([extraerTextoPdf(arrayBuffer), subirFacturaPdf(file)]);
      setFacturaPdfUrl(urlPersistida);
      const detectado = parsearFacturaPdf(texto, productos, proveedores);

      if (detectado.proveedorId) {
        const proveedorExistente = proveedores.find((p) => p.id === detectado.proveedorId);
        if (proveedorExistente) {
          seleccionarProveedor(proveedorExistente);
          // El proveedor ya existe (matcheado por RUC), pero el nombre guardado puede no
          // ser exactamente el que figura en ESTA factura -razón social actualizada,
          // mayúsculas distintas, etc.-: queda pendiente para sincronizarlo recién al
          // guardar la compra (ver guardar()) -importar el PDF solo no puede escribir
          // nada en la base todavía.
          const nombreDetectado = detectado.razonSocialEmisor?.trim();
          if (nombreDetectado && nombreDetectado !== proveedorExistente.nombre.trim()) {
            setProveedorPendiente({ modo: "sincronizar", proveedor: proveedorExistente, nombreNuevo: nombreDetectado });
          }
        }
      } else if (detectado.razonSocialEmisor) {
        // El RUC detectado no matchea ningún proveedor ya registrado: en vez de crearlo
        // ahí mismo, queda pendiente con la razón social tal cual figura en la factura
        // -recién se da de alta al guardar la compra, nunca con solo importar el PDF.
        setProveedorQuery(detectado.razonSocialEmisor);
        setProveedorPendiente({ modo: "crear", nombre: detectado.razonSocialEmisor, ruc: detectado.rucEmisor || null });
        setProveedorDetectadoHint(
          `Detectado en el PDF: ${detectado.razonSocialEmisor}${detectado.rucEmisor ? ` — RUC ${detectado.rucEmisor}` : ""} (se da de alta al guardar la compra).`
        );
      } else if (detectado.rucEmisor) {
        setProveedorDetectadoHint(
          `Detectado en el PDF: RUC ${detectado.rucEmisor} (no coincide con ningún proveedor registrado y no se pudo leer la razón social, elegilo o crealo a mano).`
        );
      }
      // Todo lo detectado se apila como UN solo paso de deshacer (Ctrl+Z revierte la
      // importación completa de una), no un paso por campo.
      const cambiosDetectados: Partial<DocumentoCompra> = {};
      if (detectado.numeroDocumento) cambiosDetectados.numeroFactura = detectado.numeroDocumento;
      if (detectado.fecha) cambiosDetectados.fecha = detectado.fecha;
      if (detectado.moneda) cambiosDetectados.moneda = detectado.moneda;
      if (detectado.notas) cambiosDetectados.notas = detectado.notas;
      if (detectado.lineas.length > 0) {
        const almacenId = almacenes[0]?.id ?? "";
        // El producto NUNCA se auto-selecciona ni se auto-crea desde el PDF -a
        // propósito-: cada proveedor escribe el mismo producto con un nombre distinto, y
        // auto-matchear/auto-crear por descripción terminaba generando productos
        // duplicados en el catálogo. Solo se guarda el nombre tal cual figura en la
        // factura como `descripcionFactura` -una sugerencia fantasma en el buscador
        // (campo vacío) que el usuario tiene que aceptar a propósito con Tab para que
        // recién ahí pase a ser un producto pendiente real (ver ProductoSelector).
        cambiosDetectados.lineas = detectado.lineas.map((l) => ({
          producto_id: "",
          almacen_id: almacenId,
          cantidad: l.cantidad,
          costo_unitario: l.costo_unitario,
          descripcionFactura: l.descripcion ? { nombre: l.descripcion, codigo: l.codigo } : undefined,
        }));
      }
      if (Object.keys(cambiosDetectados).length > 0) actualizarDocumento(cambiosDetectados);

      if (!detectado.numeroDocumento && !detectado.fecha && !detectado.proveedorId && detectado.lineas.length === 0) {
        setError("No se pudo detectar datos automáticamente en este PDF. Revisá la previsualización y completá los campos a mano.");
      }
    } catch {
      setError("No se pudo leer el PDF para autocompletar. Revisá la previsualización y completá los campos a mano.");
    } finally {
      setIsImportandoPdf(false);
    }
  }

  // Una vez confirmada, "Devolver" y "Eliminar" van lado a lado: Devolver revierte
  // stock/lote (con nota de crédito, para no perder el rastro) y queda habilitado
  // mientras quede algo para devolver; Eliminar solo borra de verdad -y por eso solo se
  // habilita- cuando ya no queda nada pendiente (borrador, que nunca tocó stock, o
  // devuelta al 100%, que ya lo revirtió todo).
  const hayAlgoParaDevolver = lineasDisponibles.some((l) => (l.cantidad_disponible ?? l.cantidad) > 0);
  const puedeEliminarDeVerdad = estado === "borrador" || estado === "devuelta";

  const actions: ModuleAction[] = [
    { key: "guardar", icon: Save, label: "Guardar borrador", onClick: handleGuardar, disabled: isSaving || !puedeEditar, tone: "primary" },
    ...(puedeEditar
      ? [{ key: "confirmar", icon: CheckCircle2, label: "Confirmar compra", onClick: handleConfirmar, disabled: isSaving }]
      : []),
    ...(puedeEditar
      ? [{ key: "importar-pdf", icon: Upload, label: "Importar factura o boleta (PDF)", onClick: handleImportarFacturaClick, disabled: isImportandoPdf }]
      : []),
    ...(entradaId && estado !== "borrador"
      ? [{
          key: "devolver",
          icon: RotateCcw,
          label: "Devolver",
          onClick: () => setMostrandoDevolucion(true),
          disabled: isSaving || !hayAlgoParaDevolver,
          title: hayAlgoParaDevolver ? undefined : "Ya se devolvió todo lo que ingresó esta compra.",
        }]
      : []),
    ...(entradaId
      ? [{
          key: "eliminar",
          icon: Trash2,
          label: "Eliminar",
          onClick: handleEliminar,
          disabled: isSaving || !puedeEliminarDeVerdad,
          tone: "danger" as const,
          title: puedeEliminarDeVerdad ? undefined : "Primero tenés que devolver todo lo que ingresó esta compra.",
        }]
      : []),
  ];

  const vistaActions: ModuleAction[] = onCambiarVista
    ? [
        { key: "compras", label: "Compras", icon: ShoppingCart, active: vista === "compras", onClick: () => onCambiarVista("compras") },
        { key: "proveedores", label: "Proveedores", icon: Truck, active: vista === "proveedores", onClick: () => onCambiarVista("proveedores") },
      ]
    : [];

  const sidebarContent = (
    <>
      {vistaActions.length > 0 && (
        <FilterSection title="Vista">
          <ModuleActions actions={vistaActions} variant="sidebar" />
        </FilterSection>
      )}
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>
    </>
  );

  // Si no hay PDF importado (compra cargada a mano) la vista previa no tiene nada que
  // mostrar: en vez de dejar ese espacio con un cartel vacío, "Líneas de productos" pasa a
  // ocupar esa columna y sale de la columna izquierda -ver el layout más abajo-.
  const lineasWidget = (
    <WidgetCard title="Líneas de productos" icon={Package}>
      <table className={styles.lineasTable}>
        <thead>
          <tr>
            <th style={{ width: "36%" }}>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario (sin IGV)</th>
            <th>Precio unitario (con IGV)</th>
            {puedeEditar && <th />}
          </tr>
        </thead>
        <tbody>
          {lineas.map((linea, index) => (
            <tr key={index}>
              <td>
                <ProductoSelector
                  value={linea.producto_id}
                  productos={productos}
                  disabled={!puedeEditar}
                  sugerenciaVacio={linea.descripcionFactura}
                  pendingName={linea.productoPendiente?.nombre}
                  onPendingNameChange={(nombre, codigo) => actualizarNombrePendiente(index, nombre, codigo)}
                  hint={linea.productoPendiente ? "Producto nuevo: se crea en el catálogo al guardar la compra." : undefined}
                  onSelect={(productoId) => actualizarLinea(index, { producto_id: productoId })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step="0.001"
                  value={parseFloat(linea.cantidad.toFixed(3))}
                  disabled={!puedeEditar}
                  onChange={(e) => actualizarLinea(index, { cantidad: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step="0.001"
                  value={parseFloat(linea.costo_unitario.toFixed(3))}
                  disabled={!puedeEditar}
                  onChange={(e) => actualizarLinea(index, { costo_unitario: Number(e.target.value) })}
                />
              </td>
              <td className={styles.precioConIgvCell}>
                {linea.costo_unitario > 0 ? `${simboloMoneda} ${(linea.costo_unitario * (1 + IGV)).toFixed(3)}` : "—"}
              </td>
              {puedeEditar && (
                <td>
                  <button type="button" className={styles.removeBtn} onClick={() => quitarLinea(index)} aria-label="Quitar línea">
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {puedeEditar && (
        <button type="button" className={styles.addLineaBtn} onClick={agregarLinea}>
          <Plus size={14} />
          Agregar línea
        </button>
      )}

      <div className={styles.totalRow}>
        <span>Total (sin IGV)</span>
        <span>{simboloMoneda} {total.toFixed(2)}</span>
      </div>
      <div className={styles.totalRow}>
        <span>IGV ({(IGV * 100).toFixed(0)}%)</span>
        <span>{simboloMoneda} {(total * IGV).toFixed(2)}</span>
      </div>
      <div className={styles.totalRow} style={{ marginTop: '0.25rem', fontWeight: '600' }}>
        <span>Total a pagar (con IGV)</span>
        <span>{simboloMoneda} {(total * (1 + IGV)).toFixed(2)}</span>
      </div>
    </WidgetCard>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleImportarFacturaFile}
        style={{ display: "none" }}
      />

      <FilterLayout
        sidebarContent={sidebarContent}
        showAlphabetIndex={false}
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
      >
        <div className={styles.page}>
          <button type="button" className={styles.volverBtn} onClick={onCancel}>
            <ChevronLeft size={15} />
            Volver
          </button>

          <div className={styles.layout} data-con-preview="">
            <div className={styles.editor}>
              <WidgetCard
                title={entrada ? `Compra N° ${entrada.numero}` : "Nueva compra"}
                icon={ShoppingCart}
                headerAction={
                  entradaId ? (
                    <span className={styles.estadoBadge} data-estado={estado}>
                      {estado === "borrador" ? "Borrador" : estado === "confirmada" ? "Confirmada" : "Cancelada"}
                    </span>
                  ) : undefined
                }
              >
                <div className={fieldStyles.row}>
                  <label className={fieldStyles.field}>
                    <span className={fieldStyles.label}>Proveedor (razón social)</span>
                    <div className={styles.proveedorBox}>
                      <input
                        className={fieldStyles.input}
                        placeholder="Buscar o escribir un proveedor…"
                        value={proveedorQuery}
                        disabled={!puedeEditar}
                        onChange={(e) => {
                          setProveedorQuery(e.target.value);
                          actualizarDocumento({ proveedorId: "" });
                          setProveedorDetectadoHint(null);
                          setProveedorDropdownAbierto(true);
                          setRucNuevoProveedor("");
                          setProveedorPendiente(null);
                        }}
                        onFocus={() => setProveedorDropdownAbierto(true)}
                        onBlur={onBlurAreaProveedor}
                      />
                      {proveedorDropdownAbierto && (
                        <div className={styles.proveedorDropdown} ref={proveedorDropdownRef}>
                          {proveedoresFiltrados.map((p) => (
                            <div
                              key={p.id}
                              className={styles.proveedorOption}
                              onMouseDown={() => seleccionarProveedor(p)}
                            >
                              {p.nombre}{p.ruc ? ` — RUC ${p.ruc}` : ""}
                            </div>
                          ))}
                          {proveedorQuery.trim() && !hayCoincidenciaExacta && (
                            <div className={styles.proveedorCrearBox}>
                              <input
                                className={styles.proveedorRucInput}
                                placeholder="RUC (opcional, evita duplicados)"
                                value={rucNuevoProveedor}
                                onChange={(e) => setRucNuevoProveedor(e.target.value)}
                                onFocus={() => setProveedorDropdownAbierto(true)}
                                onBlur={onBlurAreaProveedor}
                              />
                              <div className={styles.proveedorOptionCrear} onMouseDown={crearProveedorDesdeQuery}>
                                <Plus size={13} />
                                Crear proveedor “{proveedorQuery.trim()}”
                              </div>
                            </div>
                          )}
                          {proveedoresFiltrados.length === 0 && !proveedorQuery.trim() && (
                            <div className={styles.proveedorEmpty}>Escribí para buscar o crear un proveedor.</div>
                          )}
                        </div>
                      )}
                    </div>
                    {proveedorDetectadoHint && <span className={styles.hintText}>{proveedorDetectadoHint}</span>}
                  </label>
                  <label className={fieldStyles.field}>
                    <span className={fieldStyles.label}>N° de factura del proveedor</span>
                    <input
                      className={fieldStyles.input}
                      value={numeroFactura}
                      disabled={!puedeEditar}
                      onChange={(e) => actualizarDocumento({ numeroFactura: e.target.value })}
                    />
                  </label>
                  <label className={fieldStyles.field}>
                    <span className={fieldStyles.label}>Fecha de compra</span>
                    <input
                      type="date"
                      className={fieldStyles.input}
                      value={fecha}
                      disabled={!puedeEditar}
                      onChange={(e) => actualizarDocumento({ fecha: e.target.value })}
                    />
                  </label>
                  <label className={fieldStyles.field}>
                    <span className={fieldStyles.label}>Moneda</span>
                    <select
                      className={fieldStyles.select}
                      value={moneda}
                      disabled={!puedeEditar}
                      onChange={(e) => actualizarDocumento({ moneda: e.target.value as "PEN" | "USD" })}
                    >
                      <option value="PEN">Soles (S/)</option>
                      <option value="USD">Dólares (US$)</option>
                    </select>
                  </label>
                </div>
              </WidgetCard>

              {tienePdf && lineasWidget}

              <WidgetCard title="Notas" icon={StickyNote}>
                <label className={fieldStyles.field}>
                  <textarea
                    className={fieldStyles.textarea}
                    rows={2}
                    value={notas}
                    disabled={!puedeEditar}
                    onChange={(e) => actualizarDocumento({ notas: e.target.value })}
                  />
                </label>
              </WidgetCard>
            </div>

            <div className={styles.preview}>
              {tienePdf ? (
                <WidgetCard
                  title={`Vista previa${pdfFileName ? ` — ${pdfFileName}` : ""}${isImportandoPdf ? " (leyendo…)" : ""}`}
                  icon={FileText}
                  className={styles.previewCard}
                >
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&view=FitH`}
                    className={styles.previewFrame}
                    title="Vista previa de la factura"
                  />
                </WidgetCard>
              ) : (
                lineasWidget
              )}
            </div>
          </div>
        </div>
      </FilterLayout>

      {mostrandoDevolucion && entradaId && (
        <DevolverModal
          entrada={{ id: entradaId, lineas: lineasDisponibles }}
          onClose={() => setMostrandoDevolucion(false)}
          onSuccess={() => {
            setMostrandoDevolucion(false);
            refrescarEstadoYLineas(entradaId);
          }}
        />
      )}
    </div>
  );
}
