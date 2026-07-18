import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

const CARPETA_FACTURAS = path.join(process.cwd(), "uploads", "facturas");

export async function GET(request: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { nombre } = await params;
  // El nombre siempre lo genera el propio POST (UUID + ".pdf"): se valida el patron de
  // toda formas para no abrir un path traversal si alguna vez se arma la URL a mano.
  if (!/^[a-f0-9-]+\.pdf$/i.test(nombre)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(CARPETA_FACTURAS, nombre));
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
