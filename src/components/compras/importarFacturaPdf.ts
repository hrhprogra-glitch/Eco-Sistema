import type { Producto } from "@/components/inventario/types";
import type { Proveedor } from "@/components/proveedores/types";

export type LineaDetectada = {
  descripcion: string;
  // Código/SKU del producto tal como figura en la factura, si el proveedor lo imprime
  // separado de la descripción -- se usa como SKU al dar de alta el producto solo.
  codigo: string | null;
  cantidad: number;
  costo_unitario: number;
  producto_id: string | null;
};

export type FacturaDetectada = {
  tipoComprobante: string | null;
  numeroDocumento: string | null;
  fecha: string | null;
  moneda: "PEN" | "USD" | null;
  rucEmisor: string | null;
  razonSocialEmisor: string | null;
  proveedorId: string | null;
  notas: string | null;
  lineas: LineaDetectada[];
};

// Extrae el texto de un PDF reconstruyendo saltos de línea a partir de `hasEOL` (pdf.js no
// entrega el texto con \n reales: cada item viene posicionado por coordenadas, y hasEOL es
// la única señal de "acá termina la fila visual"). Sin esto, todo el contenido de una
// página cae en una sola línea larga y la heurística de líneas de producto no tiene forma
// de cortar filas de una tabla.
export async function extraerTextoPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  // Cargar pdfjs dinámicamente desde CDN saltándose Turbopack para evitar el maldito 404
  if (!(window as any).pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar el lector de PDFs"));
      document.body.appendChild(script);
    });
  }

  const pdfjs = (window as any).pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const documento = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let texto = "";
  for (let i = 1; i <= documento.numPages; i++) {
    const pagina = await documento.getPage(i);
    const contenido = await pagina.getTextContent();
    for (const item of contenido.items) {
      if (!("str" in item)) continue;
      texto += item.str;
      texto += item.hasEOL ? "\n" : " ";
    }
    texto += "\n";
  }
  return texto;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectarTipoComprobante(texto: string): string | null {
  const t = texto.toUpperCase();
  if (t.includes("FACTURA")) return "Factura";
  if (t.includes("BOLETA")) return "Boleta";
  if (t.includes("NOTA DE CR")) return "Nota de crédito";
  if (t.includes("NOTA DE D")) return "Nota de débito";
  return null;
}

function detectarNumeroDocumento(texto: string): string | null {
  const m = texto.match(/\b([A-Z]{1,4}\d{1,3}-\d{1,8})\b/);
  return m ? m[1] : null;
}

function detectarFecha(texto: string): string | null {
  const cerca = texto.match(/FECHA[^0-9]{0,30}(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i);
  const m = cerca ?? texto.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!m) return null;
  const [, d, mo, anio] = m;
  const mm = mo.padStart(2, "0");
  if (Number(mm) > 12 || Number(mm) < 1) return null;
  const dd = d.padStart(2, "0");
  if (Number(dd) > 31 || Number(dd) < 1) return null;
  const yyyy = anio.length === 2 ? `20${anio}` : anio;
  return `${yyyy}-${mm}-${dd}`;
}

function detectarRuc(texto: string): string | null {
  const m = texto.match(/R\.?\s?U\.?\s?C\.?[:\s]*?(\d{11})/i) ?? texto.match(/\b(\d{11})\b/);
  return m ? m[1] : null;
}

function detectarMoneda(texto: string): "PEN" | "USD" | null {
  const t = texto.toUpperCase();
  if (t.includes("DOLARES") || t.includes("DÓLARES") || t.includes("USD") || t.includes("US$")) return "USD";
  if (t.includes("SOLES") || /S\/\.?\s?\d/.test(texto)) return "PEN";
  return null;
}

// Sufijos societarios peruanos típicos (con y sin puntos) -- una línea que termina en
// uno de estos casi siempre es el nombre de una empresa, sin importar dónde caiga
// respecto del RUC en el texto extraído (el orden de lectura de pdf.js no siempre
// sigue el orden visual real del documento).
const SUFIJO_EMPRESA =
  /[A-ZÁÉÍÓÚÑ0-9&.,'’\s-]{4,90}\b(S\.?\s?A\.?\s?C\.?|S\.?\s?R\.?\s?L\.?|S\.?\s?A\.?\s?A\.?|E\.?\s?I\.?\s?R\.?\s?L\.?|S\.?\s?A\.?|S\.?\s?C\.?\s?R\.?\s?L\.?)\b/;

function limpiarCandidatoRazonSocial(texto: string): string | null {
  const limpio = texto.trim().replace(/\s+/g, " ").replace(/^[-–—.,\s]+/, "");
  return limpio.length >= 4 ? limpio : null;
}

// La razón social del emisor suele imprimirse cerca de su RUC en el encabezado del
// comprobante, pero el texto que entrega pdf.js no siempre respeta ese orden visual —
// por eso se prueba primero un patrón más confiable (una línea que termina en un
// sufijo societario, S.A.C./S.R.L./etc., buscando en un radio amplio alrededor del
// RUC) y recién si eso falla se cae al tramo en mayúsculas inmediatamente anterior.
function detectarRazonSocial(texto: string, ruc: string | null): string | null {
  if (!ruc) return null;
  const idx = texto.indexOf(ruc);
  if (idx < 0) return null;

  const alrededor = texto.slice(Math.max(0, idx - 300), Math.min(texto.length, idx + 200));
  const porSufijo = alrededor.match(SUFIJO_EMPRESA);
  if (porSufijo) {
    const candidato = limpiarCandidatoRazonSocial(porSufijo[0]);
    if (candidato) return candidato;
  }

  if (idx > 0) {
    const antes = texto.slice(Math.max(0, idx - 120), idx);
    const m = antes.match(/([A-ZÁÉÍÓÚÑ&.,\s]{6,120})$/);
    if (m) {
      const candidato = limpiarCandidatoRazonSocial(m[1]);
      if (candidato) return candidato;
    }
  }

  return null;
}

// "Observaciones"/"Notas" es un campo libre que algunos proveedores imprimen al pie del
// comprobante. Se extrae un bloque de texto (reemplazando los saltos de línea internos) 
// hasta encontrar otra palabra clave típica de fin de comprobante.
function detectarNotas(texto: string): string | null {
  const m = texto.match(/(?:OBSERVACIONES?|NOTAS?)\s*[:\-]\s*([\s\S]{3,250}?)(?=\n\s*(?:SON\s*:|TOTAL|SUB\s*TOTAL|I\.?G\.?V\.?|CONDICIONES|FORMA DE PAGO|VENDEDOR|REPRESENTACION|DATOS BANCARIOS|CUENTA EN)|$)/i);
  if (!m) return null;
  const candidato = m[1].replace(/\n/g, " ").trim().replace(/\s+/g, " ");
  return candidato.length >= 3 ? candidato : null;
}

function parseNumberPe(str: string | undefined | null): number {
  if (!str) return 0;
  const s = str.trim();
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
    return parseFloat(s.replace(/,/g, ''));
  }
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  if (/^\d+,\d{1,2}$/.test(s)) {
    return parseFloat(s.replace(',', '.'));
  }
  return parseFloat(s.replace(/,/g, ''));
}

function matchearProveedorPorRuc(ruc: string | null, proveedores: Proveedor[]): Proveedor | null {
  if (!ruc) return null;
  return proveedores.find((p) => p.ruc && p.ruc.replace(/\D/g, "") === ruc) ?? null;
}

function matchearProducto(descripcion: string, productos: Producto[]): Producto | null {
  const norm = normalizar(descripcion);
  if (norm.length < 3) return null;
  return (
    productos.find((p) => normalizar(p.sku) === norm) ??
    productos.find((p) => normalizar(p.nombre) === norm) ??
    productos.find((p) => norm.includes(normalizar(p.nombre)) || normalizar(p.nombre).includes(norm)) ??
    null
  );
}

// Muchos proveedores imprimen el código propio del ítem pegado al arranque de la
// descripción (ej. "AB-1234 CEMENTO PORTLAND TIPO I"): se separa como código propio si
// el primer token tiene pinta de código (letras+números, con o sin guión) en vez de ser
// la primera palabra real del nombre.
const PATRON_CODIGO = /^([A-Z0-9][A-Z0-9-]{2,14})\s+(?=\D)/;

function separarCodigo(descripcion: string): { codigo: string | null; descripcion: string } {
  const m = descripcion.match(PATRON_CODIGO);
  if (!m) return { codigo: null, descripcion };
  // Un token sin ningún dígito es casi seguro la primera palabra del nombre, no un
  // código -- ahí no se separa nada.
  if (!/\d/.test(m[1])) return { codigo: null, descripcion };
  return { codigo: m[1], descripcion: descripcion.slice(m[0].length).trim() };
}

// Ubica el rango de líneas donde vive la tabla de ítems: entre la fila de encabezado de
// columnas (DESCRIPCIÓN/CANT/P.UNIT/...) y el bloque de totales (TOTAL/IGV/Op. Gravada).
// Sin este límite, la heurística de filas no tiene forma de distinguir "estoy dentro de
// la tabla" de "ya salí al encabezado o al pie del comprobante" -- y texto suelto como un
// teléfono o un email puede terminar leyéndose como si fuera la descripción de un producto.
function acotarTablaItems(filas: string[]): { inicio: number; fin: number } {
  const esEncabezado = (f: string) => {
    const t = f.toUpperCase();
    return t.includes("DESCRIP") && (t.includes("CANT") || t.includes("UNIT") || t.includes("SUBTOTAL"));
  };
  const esCierre = (f: string) => /^(SUB\s*TOTAL|OP\.?\s*GRAVADA|I\.?G\.?V\.?|TOTAL|SON\s*:)/i.test(f.trim());

  const idxHeader = filas.findIndex(esEncabezado);
  if (idxHeader === -1) return { inicio: 0, fin: filas.length };

  const idxCierre = filas.findIndex((f, i) => i > idxHeader && esCierre(f));
  return { inicio: idxHeader + 1, fin: idxCierre === -1 ? filas.length : idxCierre };
}

// Heurística para las filas de la tabla de ítems: procesa tokens en lugar de usar
// RegExp complejas para evitar crasheos (ReDoS) en el compilador de Next.js (SWC/Turbopack).
function detectarLineas(texto: string, productos: Producto[]): LineaDetectada[] {
  const lineas: LineaDetectada[] = [];
  const filas = texto
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const cleanToken = (t: string) => t.replace(/^(?:S\/\.?|\$|USD)\s*/i, '');
  const isUnidad = (t: string) => ["NIU", "UND", "U", "KG", "KGM", "MTR", "LTR", "CJA", "GLN", "PZA", "UNIDAD", "CAJA", "M2", "M3", "PAR", "BOLSA", "SACO", "SERV"].includes(t.toUpperCase());
  const isNumber = (t: string) => /^[\d.,]*\d[\d.,]*$/.test(cleanToken(t));
  const isCurrency = (t: string) => ["S/", "$", "USD", "S/."].includes(t.toUpperCase());

  // Conectores cortos en español que no hay que confundir con un pedazo de código cuando
  // una descripción en mayúsculas envuelve justo en una palabra de 1-3 letras.
  const CONECTOR_CORTO = new Set(["DE", "Y", "EL", "LA", "LOS", "LAS", "UN", "UNA", "DEL", "EN", "A", "O", "SU", "AL"]);
  const esFragmentoCodigo = (t: string) =>
    t.length <= 3 && /^[A-Z0-9-]+$/.test(t) && !isNumber(t) && !isUnidad(t) && !CONECTOR_CORTO.has(t);

  const { inicio, fin } = acotarTablaItems(filas);

  // Texto de descripción (ya sin el código) que el PDF partió en varias líneas visuales
  // antes de llegar a la línea "de cierre" (la que trae cantidad + unidad + precio): se
  // va acumulando acá y recién se une a la fila cuando esa línea de cierre aparece.
  let pendiente = "";
  // Código del proveedor detectado en la primera línea de la fila actual. La columna de
  // código suele ser angosta: un código como "SERV-INST" puede partirse letra por medio
  // ("SERV-INS" / "T"), no solo por guion -- ese pedazo suelto tiene que sumarse acá, no
  // colarse en medio de la descripción como una palabra más.
  let codigoEnCurso: string | null = null;

  for (let idx = inicio; idx < fin; idx++) {
    const fila = filas[idx];
    let tokens = fila.split(/\s+/);

    if (codigoEnCurso !== null && tokens.length > 0 && esFragmentoCodigo(tokens[0])) {
      codigoEnCurso += tokens[0];
      tokens = tokens.slice(1);
    }

    const unitIndex = tokens.findIndex(t => isUnidad(t));
    if (unitIndex === -1) {
      // Primera línea de una fila nueva: si arranca con un código en mayúsculas, se separa
      // antes de acumular para que no quede pegado a la descripción.
      if (!pendiente && codigoEnCurso === null) {
        const primer = tokens[0];
        if (primer && /^[A-Z0-9-]{2,20}$/.test(primer) && !isNumber(primer)) {
          codigoEnCurso = primer;
          tokens = tokens.slice(1);
        }
      }
      // No cierra ninguna fila: es la continuación envuelta de la descripción -- se
      // guarda para unirla a la próxima línea que sí cierre.
      const resto = tokens.join(" ");
      if (resto && !tokens.every((t) => isNumber(t) || isCurrency(t))) {
        pendiente = pendiente ? `${pendiente} ${resto}` : resto;
      }
      continue;
    }

    // Extraer Precio: El PRIMER número después de la unidad
    const tokensAfterUnit = tokens.slice(unitIndex + 1);
    const numsAfterUnit = tokensAfterUnit.filter(isNumber);
    if (numsAfterUnit.length === 0) { pendiente = ""; codigoEnCurso = null; continue; }
    const precioStr = cleanToken(numsAfterUnit[0]);

    // Extraer Cantidad: El ÚLTIMO número antes de la unidad
    const tokensBeforeUnit = tokens.slice(0, unitIndex);
    let qtyStr = "";
    let qtyTokenIndex = -1;
    for (let j = tokensBeforeUnit.length - 1; j >= 0; j--) {
        if (isNumber(tokensBeforeUnit[j])) {
            qtyStr = cleanToken(tokensBeforeUnit[j]);
            qtyTokenIndex = j;
            break;
        }
    }

    const descTokens = tokensBeforeUnit.slice(0, qtyTokenIndex !== -1 ? qtyTokenIndex : tokensBeforeUnit.length);

    // La cantidad quedó en la línea anterior (celda envuelta justo antes del número):
    // se recupera del final de lo acumulado en "pendiente" en vez de descartar la fila.
    if (qtyTokenIndex === -1 && pendiente) {
      const pendienteTokens = pendiente.split(/\s+/);
      const ultimo = pendienteTokens[pendienteTokens.length - 1];
      if (isNumber(ultimo)) {
        qtyStr = cleanToken(ultimo);
        pendiente = pendienteTokens.slice(0, -1).join(" ");
      }
    }

    const textoCompleto = [pendiente, descTokens.join(" ")].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    pendiente = "";

    const cantidad = parseNumberPe(qtyStr);
    const costo_unitario = parseNumberPe(precioStr);
    if (!cantidad || !costo_unitario) { codigoEnCurso = null; continue; }
    if (textoCompleto.length < 3) { codigoEnCurso = null; continue; }

    let codigoStr: string | null;
    let descripcion: string;
    if (codigoEnCurso !== null) {
      // El código ya se separó línea por línea (incluyendo fragmentos partidos a mitad
      // de palabra por el ancho de columna): acá solo queda la descripción.
      codigoStr = codigoEnCurso;
      descripcion = textoCompleto;
    } else {
      // Fila de una sola línea: el código, si existe, puede ser puramente alfabético
      // (ej. "SERV-INST"), por eso se prueba primero con un chequeo laxo (mayúsculas/
      // números/guion, no un número puro) antes de caer a separarCodigo(), que exige al
      // menos un dígito en el código.
      const primerToken = textoCompleto.split(/\s+/)[0] ?? "";
      if (/^[A-Z0-9-]{2,20}$/.test(primerToken) && !isNumber(primerToken)) {
        codigoStr = primerToken;
        descripcion = textoCompleto.slice(primerToken.length).trim();
      } else {
        const separado = separarCodigo(textoCompleto);
        codigoStr = separado.codigo;
        descripcion = separado.descripcion;
      }
    }
    codigoEnCurso = null;

    if (descripcion.length < 3) continue;

    const producto = matchearProducto(descripcion, productos);
    lineas.push({ descripcion, codigo: codigoStr, cantidad, costo_unitario, producto_id: producto?.id ?? null });
  }
  return lineas;
}

export function parsearFacturaPdf(
  texto: string,
  productos: Producto[],
  proveedores: Proveedor[]
): FacturaDetectada {
  const rucEmisor = detectarRuc(texto);
  const proveedor = matchearProveedorPorRuc(rucEmisor, proveedores);

  return {
    tipoComprobante: detectarTipoComprobante(texto),
    numeroDocumento: detectarNumeroDocumento(texto),
    fecha: detectarFecha(texto),
    moneda: detectarMoneda(texto),
    rucEmisor,
    razonSocialEmisor: detectarRazonSocial(texto, rucEmisor),
    proveedorId: proveedor?.id ?? null,
    notas: detectarNotas(texto),
    lineas: detectarLineas(texto, productos),
  };
}
