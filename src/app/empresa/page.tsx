import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { BienvenidaView } from "./components/BienvenidaView";
import { AbrirView } from "./components/AbrirView";
import { EMPRESA_COOKIE, parseEmpresa } from "./types";

export default async function EmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const { vista } = await searchParams;
  const empresa = parseEmpresa((await cookies()).get(EMPRESA_COOKIE)?.value);

  if (!empresa && vista !== "abrir") {
    return <BienvenidaView />;
  }

  const session = await getSession();

  return <AbrirView empresa={empresa} username={session?.username ?? null} />;
}
