"use client";

import { createContext, useContext, type ReactNode } from "react";

const SessionContext = createContext<{ username: string | null; permisos: string[] }>({ username: null, permisos: [] });

export function SessionProvider({
  username,
  permisos,
  children,
}: {
  username: string | null;
  permisos: string[];
  children: ReactNode;
}) {
  return <SessionContext.Provider value={{ username, permisos }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
