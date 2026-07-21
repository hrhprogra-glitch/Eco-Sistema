import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { nombre } = await params;
  if (!/^[a-f0-9-]+\.pdf$/i.test(nombre)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data } = supabase.storage.from("facturas").getPublicUrl(nombre);
  
  // Redirigir directamente a la URL pública de Supabase
  if (data?.publicUrl) {
    return NextResponse.redirect(data.publicUrl);
  }

  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
