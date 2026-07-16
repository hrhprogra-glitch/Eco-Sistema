// Importa un Word (.docx) y extrae cliente/fecha/items para precargar el formulario de
// Cotización con nuestro propio estilo (la plantilla ya existente en CotizacionForm/.sheet).
// El Word original no necesita traer ningún diseño: solo el texto en bruto, que acá se
// interpreta con reglas simples (mismo enfoque que Ecosistema-Document/procesadorWord.ts).

export type LineaImportada = {
  descripcion: string;
  cantidad: number;
  precio: number;
};

export type DatosImportadosCotizacion = {
  cliente: string;
  fecha: string | null;
  lineas: LineaImportada[];
  total: number | null;
};

const TITULOS_CLIENTE = "SE[ÑN]OR(?:\\(ES\\)|\\(AS\\)|A|ES)?|CLIENTE|ATENCI[ÓO]N|ING|ARQ|DRA?|LIC|SRA?|SRTA";

// La línea de TOTAL/MONTO tiene la misma forma "texto....precio" que cualquier ítem, así
// que sin este chequeo terminaba entrando como una fila más (duplicando el importe). Se
// compara la etiqueta ya separada del precio, no el texto completo de la línea.
const TITULO_TOTAL_REGEX = /^(?:PRECIO\s+TOTAL|TOTAL|MONTO|COSTO|IMPORTE)\.?\s*:?$/i;

// Detecta "dd/mm/yyyy" y lo convierte a "yyyy-mm-dd" para <input type="date">. Las fechas
// escritas en palabras ("12 de julio del 2026") no se intentan parsear: quedan como fecha
// del día por defecto, igual que al crear una cotización nueva a mano.
function extraerFechaISO(texto: string): string | null {
  const match = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, dia, mes, anio] = match;
  return `${anio}-${mes}-${dia}`;
}

const DOT_LEADER_REGEX = /^(.+?)[\s.·•…:]*((?:S\s*\/\s*\.?|US\s*\$|U\s*\$|\$)\s*[\d,]+(?:\.\d{2})?)\s*$/i;

function parsearMonto(texto: string): number {
  const numero = texto.replace(/[^\d.,]/g, "").replace(/,/g, "");
  return parseFloat(numero) || 0;
}

export function procesarCotizacionWord(html: string): DatosImportadosCotizacion {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  let cliente = "";
  let fecha: string | null = null;
  let total: number | null = null;
  let nextIsClient = false;
  const lineas: LineaImportada[] = [];

  Array.from(tempDiv.children).forEach((child) => {
    const text = child.textContent?.trim() || "";
    if (!text) return;
    const upperText = text.toUpperCase();

    if (upperText.includes("@") || /^E-?MAIL\b/.test(upperText) || /^CORREO\b/.test(upperText)) return;

    if (!fecha) {
      const posibleFecha = extraerFechaISO(text);
      if (posibleFecha) {
        fecha = posibleFecha;
        return;
      }
    }

    if (upperText.match(new RegExp(`^(?:${TITULOS_CLIENTE})\\.?\\s*:?$`))) {
      nextIsClient = true;
      return;
    }
    if (nextIsClient) {
      cliente = text;
      nextIsClient = false;
      return;
    }
    const inlineClient = text.match(new RegExp(`^(?:${TITULOS_CLIENTE})\\.?\\s*:\\s*(.+)$`, "i"));
    if (inlineClient && !cliente) {
      cliente = inlineClient[1].trim();
      return;
    }

    const match = text.match(DOT_LEADER_REGEX);
    if (match) {
      const etiqueta = match[1].trim();
      const monto = parsearMonto(match[2]);
      if (TITULO_TOTAL_REGEX.test(etiqueta)) {
        total = monto;
        return;
      }
      lineas.push({ descripcion: etiqueta, cantidad: 1, precio: monto });
    }
  });

  if (lineas.length === 0) {
    lineas.push({ descripcion: "SERVICIO GENERAL", cantidad: 1, precio: 0 });
  }

  return { cliente, fecha, lineas, total };
}
