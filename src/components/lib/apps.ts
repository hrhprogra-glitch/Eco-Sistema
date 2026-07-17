import {
  BookUser,
  FileText,
  ClipboardCheck,
  Boxes,
  ShoppingCart,
  PackageMinus,
  Users,
  CalendarCheck,
  Palmtree,
  Banknote,
  FolderArchive,
  FolderKanban,
  CalendarDays,
  Waves,
  CheckSquare,
  Wrench,
  Car,
  HardHat,
  FlaskConical,
  Target,
  FileBarChart,
  BarChart3,
  LineChart,
  UserCog,
  ShieldCheck,
  Building2,
  Plug,
  History,
  Settings,
  Briefcase,
  Download,
  type LucideIcon,
} from "lucide-react";

export type Section = {
  slug: string;
  name: string;
  icon: LucideIcon;
  implemented: boolean;
};

export type ModuleGroup = {
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: LucideIcon;
  sections: Section[];
};

export const appGroups: ModuleGroup[] = [
  {
    slug: "contacto",
    name: "Clientes",
    description: "Contactos y clientes de la empresa.",
    color: "#714B67",
    icon: BookUser,
    sections: [{ slug: "contacto", name: "Clientes", icon: BookUser, implemented: true }],
  },
  {
    slug: "cotizaciones",
    name: "Cotizaciones",
    description: "Cotizaciones y ventas a clientes.",
    color: "#8E44AD",
    icon: FileText,
    sections: [{ slug: "cotizaciones", name: "Cotizaciones", icon: FileText, implemented: true }],
  },
  {
    slug: "calendario",
    name: "Calendario",
    description: "Agenda y eventos comerciales.",
    color: "#6C3483",
    icon: CalendarDays,
    sections: [{ slug: "calendario", name: "Calendario", icon: CalendarDays, implemented: true }],
  },
  {
    slug: "salidas",
    name: "Salidas",
    description: "Salidas de stock por lote.",
    color: "#C62828",
    icon: PackageMinus,
    sections: [{ slug: "salidas", name: "Salidas", icon: PackageMinus, implemented: true }],
  },
  {
    slug: "compras",
    name: "Compras",
    description: "Entradas de stock por factura de proveedor.",
    color: "#B8860B",
    icon: ShoppingCart,
    sections: [{ slug: "compras", name: "Compras", icon: ShoppingCart, implemented: true }],
  },
  {
    slug: "stock",
    name: "Stock",
    description: "Existencia actual por producto y almacén.",
    color: "#00695C",
    icon: Boxes,
    sections: [{ slug: "stock", name: "Stock", icon: Boxes, implemented: true }],
  },
  {
    slug: "recursos-humanos",
    name: "Recursos Humanos",
    description: "Empleados, asistencia, nómina, vacaciones, permisos y documentos.",
    color: "#C2185B",
    icon: Users,
    sections: [
      { slug: "empleados", name: "Empleados", icon: Users, implemented: true },
      { slug: "asistencia", name: "Asistencia", icon: CalendarCheck, implemented: true },
      { slug: "nomina", name: "Nómina", icon: Banknote, implemented: true },
      { slug: "vacaciones-permisos", name: "Vacaciones y Permisos", icon: Palmtree, implemented: true },
      { slug: "documentos-rrhh", name: "Documentos", icon: FolderArchive, implemented: true },
    ],
  },
  {
    slug: "operaciones",
    name: "Operaciones",
    description: "Proyectos, tareas, órdenes de trabajo, calendario y mantenimientos.",
    color: "#2E7D32",
    icon: FolderKanban,
    sections: [
      { slug: "proyectos", name: "Proyectos", icon: FolderKanban, implemented: true },
      { slug: "tareas", name: "Tareas", icon: CheckSquare, implemented: true },
      { slug: "ordenes-trabajo", name: "Órdenes de Trabajo", icon: ClipboardCheck, implemented: true },
      { slug: "calendario", name: "Calendario", icon: CalendarDays, implemented: true },
      { slug: "mantenimientos-operaciones", name: "Mantenimientos", icon: Wrench, implemented: true },
    ],
  },
  {
    slug: "activos",
    name: "Activos",
    description: "Vehículos, equipos, mantenimientos, documentos e historial de activos.",
    color: "#455A64",
    icon: Car,
    sections: [
      { slug: "vehiculos", name: "Vehículos", icon: Car, implemented: true },
      { slug: "equipos", name: "Equipos", icon: HardHat, implemented: true },
      { slug: "mantenimientos", name: "Mantenimientos", icon: Wrench, implemented: true },
      { slug: "documentos-activos", name: "Documentos", icon: FolderArchive, implemented: true },
      { slug: "historial-activos", name: "Historial", icon: History, implemented: true },
    ],
  },
  {
    slug: "analitica",
    name: "Analítica",
    description: "Reportes, indicadores, estadísticas, exportaciones y auditoría.",
    color: "#00838F",
    icon: BarChart3,
    sections: [
      { slug: "reportes", name: "Reportes", icon: FileBarChart, implemented: true },
      { slug: "kpis", name: "Indicadores (KPIs)", icon: Target, implemented: true },
      { slug: "estadisticas", name: "Estadísticas", icon: BarChart3, implemented: true },
      { slug: "exportaciones", name: "Exportaciones", icon: Download, implemented: true },
      { slug: "auditoria", name: "Auditoría", icon: History, implemented: true },
    ],
  },
  {
    slug: "resumen",
    name: "Gráficos",
    description: "Panel visual con gráficos y métricas clave del negocio.",
    color: "#5E35B1",
    icon: LineChart,
    sections: [{ slug: "resumen", name: "Gráficos", icon: LineChart, implemented: true }],
  },
  {
    slug: "administracion",
    name: "Administración",
    description: "Usuarios, roles y permisos, empresas y sucursales, configuración e integraciones.",
    color: "#37474F",
    icon: Briefcase,
    sections: [
      { slug: "usuarios", name: "Usuarios", icon: UserCog, implemented: true },
      { slug: "roles-permisos", name: "Roles y Permisos", icon: ShieldCheck, implemented: true },
      { slug: "empresas-sucursales", name: "Empresas y Sucursales", icon: Building2, implemented: true },
      { slug: "configuraciones", name: "Configuración", icon: Settings, implemented: true },
      { slug: "integraciones", name: "Integraciones", icon: Plug, implemented: true },
    ],
  },
  {
    slug: "piscina",
    name: "Piscinas",
    description: "Piscinas, mantenimientos, controles químicos, equipos e historial.",
    color: "#0288D1",
    icon: Waves,
    sections: [
      { slug: "piscina", name: "Piscinas", icon: Waves, implemented: true },
      { slug: "mantenimientos-piscina", name: "Mantenimientos", icon: Wrench, implemented: true },
      { slug: "controles-quimicos", name: "Controles Químicos", icon: FlaskConical, implemented: true },
      { slug: "equipos-piscina", name: "Equipos", icon: HardHat, implemented: true },
      { slug: "historial-piscina", name: "Historial", icon: History, implemented: true },
    ],
  },
];

export function getGroup(slug: string) {
  return appGroups.find((group) => group.slug === slug);
}
