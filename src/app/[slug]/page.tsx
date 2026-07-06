import { notFound } from "next/navigation";
import { apps, getApp } from "@/components/lib/apps";

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

const moduleComponents: Record<string, React.ComponentType> = {
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

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  const ModuleComponent = moduleComponents[slug];

  if (!app || !ModuleComponent) {
    notFound();
  }

  return <ModuleComponent />;
}
