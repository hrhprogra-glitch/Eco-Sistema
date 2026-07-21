import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Inicializamos el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const nombreArchivo = `${randomUUID()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Subir el archivo al bucket "facturas" en Supabase Storage
  const { data, error } = await supabase.storage
    .from("facturas")
    .upload(nombreArchivo, buffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error subiendo a Supabase Storage:", error);
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }

  // Devolver la misma ruta de siempre (para que la base de datos guarde solo el nombre)
  // El frontend y la base de datos esperan el formato local, pero ahora el GET redireccionará a Supabase.
  return NextResponse.json({ url: `/api/uploads/factura/${nombreArchivo}` });
}
