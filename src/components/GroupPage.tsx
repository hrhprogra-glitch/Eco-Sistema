"use client";

import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { getGroup } from "@/components/lib/apps";

import VentasModule from "@/components/ventas";
import CrmModule from "@/components/crm";
import FacturacionModule from "@/components/facturacion";
import ContabilidadModule from "@/components/contabilidad";
import GastosModule from "@/components/gastos";
import CajaModule from "@/components/caja";
import BancosModule from "@/components/bancos";
import CuentasCobrarModule from "@/components/cuentas-cobrar";
import CuentasPagarModule from "@/components/cuentas-pagar";
import InventarioModule from "@/components/inventario";
import AlmacenesModule from "@/components/almacenes";
import ComprasModule from "@/components/compras";
import ProveedoresModule from "@/components/proveedores";
import MovimientosModule from "@/components/movimientos";
import VehiculosModule from "@/components/vehiculos";
import EquiposModule from "@/components/equipos";
import MantenimientosModule from "@/components/mantenimientos";
import DocumentosActivosModule from "@/components/documentos-activos";
import HistorialActivosModule from "@/components/historial-activos";
import ProyectosModule from "@/components/proyectos";
import TareasModule from "@/components/tareas";
import OrdenesTrabajoModule from "@/components/ordenes-trabajo";
import MantenimientosOperacionesModule from "@/components/mantenimientos-operaciones";
import EmpleadosModule from "@/components/empleados";
import AsistenciaModule from "@/components/asistencia";
import NominaModule from "@/components/nomina";
import VacacionesPermisosModule from "@/components/vacaciones-permisos";
import DocumentosRrhhModule from "@/components/documentos-rrhh";
import CorreoModule from "@/components/correo";
import ContactoModule from "@/components/contacto";
import PiscinaModule from "@/components/piscina";
import MantenimientosPiscinaModule from "@/components/mantenimientos-piscina";
import ControlesQuimicosModule from "@/components/controles-quimicos";
import EquiposPiscinaModule from "@/components/equipos-piscina";
import HistorialPiscinaModule from "@/components/historial-piscina";
import ConfiguracionesModule from "@/components/configuraciones";
import CalendarioModule from "@/components/calendario";
import CotizacionesModule from "@/components/cotizaciones";
import PedidosModule from "@/components/pedidos";
import DashboardAnaliticaModule from "@/components/dashboard-analitica";
import KpisModule from "@/components/kpis";
import ReportesModule from "@/components/reportes";
import EstadisticasModule from "@/components/estadisticas";
import ExportacionesModule from "@/components/exportaciones";
import AuditoriaModule from "@/components/auditoria";
import UsuariosModule from "@/components/usuarios";
import RolesPermisosModule from "@/components/roles-permisos";
import EmpresasSucursalesModule from "@/components/empresas-sucursales";
import IntegracionesModule from "@/components/integraciones";
import ComercialCharts from "@/components/graficos/components/ComercialCharts";
import FinanzasCharts from "@/components/graficos/components/FinanzasCharts";
import InventarioCharts from "@/components/graficos/components/InventarioCharts";
import AnaliticaCharts from "@/components/graficos/components/AnaliticaCharts";

const sectionComponents: Record<string, React.ComponentType> = {
  ventas: VentasModule,
  crm: CrmModule,
  facturacion: FacturacionModule,
  contabilidad: ContabilidadModule,
  gastos: GastosModule,
  caja: CajaModule,
  bancos: BancosModule,
  "cuentas-cobrar": CuentasCobrarModule,
  "cuentas-pagar": CuentasPagarModule,
  inventario: InventarioModule,
  almacenes: AlmacenesModule,
  compras: ComprasModule,
  proveedores: ProveedoresModule,
  movimientos: MovimientosModule,
  vehiculos: VehiculosModule,
  equipos: EquiposModule,
  mantenimientos: MantenimientosModule,
  "documentos-activos": DocumentosActivosModule,
  "historial-activos": HistorialActivosModule,
  proyectos: ProyectosModule,
  tareas: TareasModule,
  "ordenes-trabajo": OrdenesTrabajoModule,
  "mantenimientos-operaciones": MantenimientosOperacionesModule,
  empleados: EmpleadosModule,
  asistencia: AsistenciaModule,
  nomina: NominaModule,
  "vacaciones-permisos": VacacionesPermisosModule,
  "documentos-rrhh": DocumentosRrhhModule,
  correo: CorreoModule,
  contacto: ContactoModule,
  piscina: PiscinaModule,
  "mantenimientos-piscina": MantenimientosPiscinaModule,
  "controles-quimicos": ControlesQuimicosModule,
  "equipos-piscina": EquiposPiscinaModule,
  "historial-piscina": HistorialPiscinaModule,
  configuraciones: ConfiguracionesModule,
  calendario: CalendarioModule,
  cotizaciones: CotizacionesModule,
  pedidos: PedidosModule,
  "dashboard-analitica": DashboardAnaliticaModule,
  kpis: KpisModule,
  reportes: ReportesModule,
  estadisticas: EstadisticasModule,
  exportaciones: ExportacionesModule,
  auditoria: AuditoriaModule,
  usuarios: UsuariosModule,
  "roles-permisos": RolesPermisosModule,
  "empresas-sucursales": EmpresasSucursalesModule,
  integraciones: IntegracionesModule,
  "graficos-comercial": ComercialCharts,
  "graficos-finanzas": FinanzasCharts,
  "graficos-inventario": InventarioCharts,
  "graficos-analitica": AnaliticaCharts,
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
