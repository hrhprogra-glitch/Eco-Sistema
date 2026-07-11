import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/sidebar/SidebarProvider";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/Topbar";
import { EmpresaProvider } from "@/components/empresa/EmpresaProvider";
import { EMPRESA_COOKIE, parseEmpresa } from "@/app/empresa/types";
import styles from "./layout.module.css";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const empresaCookie = (await cookies()).get(EMPRESA_COOKIE)?.value;
  const empresa = parseEmpresa(empresaCookie);

  return (
    <EmpresaProvider nombre={empresa?.nombre ?? null}>
      <SidebarProvider>
        <div className={styles.shell}>
          <Sidebar />
          <div className={styles.mainColumn}>
            <Topbar />
            <main className={styles.content}>{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </EmpresaProvider>
  );
}
