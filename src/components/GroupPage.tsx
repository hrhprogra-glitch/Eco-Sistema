"use client";

import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { getGroup } from "@/components/lib/apps";

import VentasModule from "@/components/ventas";
import CrmModule from "@/components/crm";
import FacturacionModule from "@/components/facturacion";
import ContabilidadModule from "@/components/contabilidad";
import GastosModule from "@/components/gastos";
import InventarioModule from "@/components/inventario";
import ProyectosModule from "@/components/proyectos";
import EmpleadosModule from "@/components/empleados";
import CorreoModule from "@/components/correo";
import ContactoModule from "@/components/contacto";
import PiscinaModule from "@/components/piscina";
import ConfiguracionesModule from "@/components/configuraciones";
import CalendarioModule from "@/components/calendario";

const sectionComponents: Record<string, React.ComponentType> = {
  ventas: VentasModule,
  crm: CrmModule,
  facturacion: FacturacionModule,
  contabilidad: ContabilidadModule,
  gastos: GastosModule,
  inventario: InventarioModule,
  proyectos: ProyectosModule,
  empleados: EmpleadosModule,
  correo: CorreoModule,
  contacto: ContactoModule,
  piscina: PiscinaModule,
  configuraciones: ConfiguracionesModule,
  calendario: CalendarioModule,
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
