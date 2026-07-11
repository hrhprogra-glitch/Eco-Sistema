"use client";

import { createContext, useContext, type ReactNode } from "react";

const EmpresaContext = createContext<{ nombre: string | null }>({ nombre: null });

export function EmpresaProvider({
  nombre,
  children,
}: {
  nombre: string | null;
  children: ReactNode;
}) {
  return <EmpresaContext.Provider value={{ nombre }}>{children}</EmpresaContext.Provider>;
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
