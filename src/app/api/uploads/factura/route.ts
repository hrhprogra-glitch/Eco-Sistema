import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

// Carpeta afuera de `public/` y de `.next/`: `public/` se copia una sola vez al empaquetar
// el build standalone (ver scripts/prepare-standalone.js), asi que un archivo escrito ahi
// en tiempo de ejecucion no aparece en la build ya empaquetada. Se sirve por su cuenta via
// GET /api/uploads/factura/[nombre], no como estatico de Next.
const CARPETA_FACTURAS = path.join(process.cwd(), "uploads", "facturas");

// Guarda la factura/boleta en PDF que se importa en Compras (ver
// src/components/compras/components/EntradaForm.tsx) para poder volver a verla al reabrir
// la compra mas adelante -antes solo vivia como blob URL en el navegador y se perdia al
// recargar la pagina.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF." }, { status: 400 });
  }

  await mkdir(CARPETA_FACTURAS, { recursive: true });
  const nombreArchivo = `${randomUUID()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(CARPETA_FACTURAS, nombreArchivo), buffer);

  return NextResponse.json({ url: `/api/uploads/factura/${nombreArchivo}` });
}
