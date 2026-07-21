"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { getGroup } from "@/components/lib/apps";

// Carga diferida: cada módulo se compila/descarga recién cuando se entra a esa
// sección, no los ~50 juntos apenas se abre cualquier grupo del panel (antes
// todos estos eran imports estáticos arriba del archivo, y eso hacía que
// entrar a CUALQUIER sesión cargara el código de todas las demás también).
const sectionComponents: Record<string, React.ComponentType> = {
  crm: dynamic(() => import("@/components/crm")),
  facturacion: dynamic(() => import("@/components/facturacion")),
  contabilidad: dynamic(() => import("@/components/contabilidad")),
  gastos: dynamic(() => import("@/components/gastos")),
  caja: dynamic(() => import("@/components/caja")),
  bancos: dynamic(() => import("@/components/bancos")),
  "cuentas-cobrar": dynamic(() => import("@/components/cuentas-cobrar")),
  "cuentas-pagar": dynamic(() => import("@/components/cuentas-pagar")),
  salidas: dynamic(() => import("@/components/salidas")),
  compras: dynamic(() => import("@/components/compras")),
  stock: dynamic(() => import("@/components/stock")),
  // proveedores/movimientos ya no tienen ningún grupo que los muestre en el sidebar --
  // proveedores/index.tsx se reutiliza directo como pestaña dentro de Compras
  // (components/ComprasList.tsx vive junto a él), y movimientos/index.tsx se borró: su
  // EntradaForm pasó a compras/components y su SalidaForm a salidas/components. Las rutas
  // API, las tablas de la base y movimientos/types.ts (tipos compartidos) siguen intactos.
  activos: dynamic(() => import("@/components/activos")),
  correo: dynamic(() => import("@/components/correo")),
  contacto: dynamic(() => import("@/components/contacto")),
  piscina: dynamic(() => import("@/components/piscina")),
  configuraciones: dynamic(() => import("@/components/configuraciones")),
  calendario: dynamic(() => import("@/components/calendario")),
  cotizaciones: dynamic(() => import("@/components/cotizaciones")),
  "dashboard-analitica": dynamic(() => import("@/components/dashboard-analitica")),
  "empresas-sucursales": dynamic(() => import("@/components/empresas-sucursales")),
  integraciones: dynamic(() => import("@/components/integraciones")),
  resumen: dynamic(() => import("@/components/graficos")),
  administracion: dynamic(() => import("@/components/administracion")),
};

export function GroupPage({ groupSlug }: { groupSlug: string }) {
  const searchParams = useSearchParams();
  const group = getGroup(groupSlug);

  if (!group) {
    return null;
  }

  const activeSlug = searchParams.get("s") ?? group.sections[0]?.slug;
  const section = group.sections.find((s) => s.slug === activeSlug) ?? group.sections[0];

  if (!section) {
    return <EmptyState icon={group.icon} title={group.name} description={group.description} />;
  }

  const Component = section.implemented ? sectionComponents[section.slug] : undefined;

  if (!Component) {
    return (
      <EmptyState icon={section.icon} title={section.name} description="Disponible próximamente." />
    );
  }

  return <Component />;
}
