export const EMPRESA_COOKIE = "eco_empresa";

export type EmpresaActual = {
  nombre: string;
  creadaEn: string;
};

export function parseEmpresa(raw: string | undefined): EmpresaActual | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (typeof data?.nombre === "string" && typeof data?.creadaEn === "string") {
      return data as EmpresaActual;
    }
    return null;
  } catch {
    return null;
  }
}
