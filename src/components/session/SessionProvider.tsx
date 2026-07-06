"use client";

import { createContext, useContext, type ReactNode } from "react";

const SessionContext = createContext<{ username: string | null }>({ username: null });

export function SessionProvider({
  username,
  children,
}: {
  username: string | null;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={{ username }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
