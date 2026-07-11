import {
  TrendingUp,
  Handshake,
  BookUser,
  Mail,
  FileText,
  ClipboardList,
  Activity,
  Package,
  Tags,
  Warehouse,
  ScrollText,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  MapPinned,
  Receipt,
  Calculator,
  CreditCard,
  Wallet,
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  Percent,
  Users,
  CalendarCheck,
  Palmtree,
  FileCheck,
  Banknote,
  FolderArchive,
  FolderKanban,
  CalendarDays,
  Waves,
  CheckSquare,
  Wrench,
  Car,
  Cog,
  HardHat,
  Hammer,
  LayoutDashboard,
  Target,
  FileBarChart,
  BarChart3,
  UserCog,
  ShieldCheck,
  Building2,
  MapPin,
  Plug,
  History,
  Settings,
  Briefcase,
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
    slug: "comercial",
    name: "Comercial",
    description: "CRM, clientes, contactos, cotizaciones, pedidos, ventas y seguimiento comercial.",
    color: "#714B67",
    icon: TrendingUp,
    sections: [
      { slug: "ventas", name: "Ventas", icon: TrendingUp, implemented: true },
      { slug: "crm", name: "CRM", icon: Handshake, implemented: true },
      { slug: "contacto", name: "Clientes y contactos", icon: BookUser, implemented: true },
      { slug: "correo", name: "Correo electrónico", icon: Mail, implemented: true },
      { slug: "cotizaciones", name: "Cotizaciones", icon: FileText, implemented: false },
      { slug: "pedidos", name: "Pedidos", icon: ClipboardList, implemented: false },
      { slug: "seguimiento-comercial", name: "Seguimiento comercial", icon: Activity, implemented: false },
    ],
  },
  {
    slug: "inventario",
    name: "Inventario",
    description: "Productos, categorías, almacenes, stock, kardex, movimientos, compras, proveedores y logística.",
    color: "#B8860B",
    icon: Package,
    sections: [
      { slug: "inventario", name: "Productos y stock", icon: Package, implemented: true },
      { slug: "categorias", name: "Categorías", icon: Tags, implemented: false },
      { slug: "almacenes", name: "Almacenes", icon: Warehouse, implemented: false },
      { slug: "kardex", name: "Kardex", icon: ScrollText, implemented: false },
      { slug: "movimientos", name: "Movimientos", icon: ArrowLeftRight, implemented: false },
      { slug: "compras", name: "Compras", icon: ShoppingCart, implemented: false },
      { slug: "proveedores", name: "Proveedores", icon: Truck, implemented: false },
      { slug: "logistica", name: "Logística básica", icon: MapPinned, implemented: false },
    ],
  },
  {
    slug: "finanzas",
    name: "Finanzas",
    description: "Facturación, caja, bancos, gastos, cuentas por cobrar, cuentas por pagar, impuestos y contabilidad.",
    color: "#2C5F9E",
    icon: Calculator,
    sections: [
      { slug: "facturacion", name: "Facturación", icon: Receipt, implemented: true },
      { slug: "contabilidad", name: "Contabilidad", icon: Calculator, implemented: true },
      { slug: "gastos", name: "Gastos", icon: CreditCard, implemented: true },
      { slug: "caja", name: "Caja", icon: Wallet, implemented: false },
      { slug: "bancos", name: "Bancos", icon: Landmark, implemented: false },
      { slug: "cuentas-cobrar", name: "Cuentas por cobrar", icon: ArrowDownToLine, implemented: false },
      { slug: "cuentas-pagar", name: "Cuentas por pagar", icon: ArrowUpFromLine, implemented: false },
      { slug: "impuestos", name: "Impuestos", icon: Percent, implemented: false },
    ],
  },
  {
    slug: "recursos-humanos",
    name: "Recursos Humanos",
    description: "Empleados, asistencia, vacaciones, permisos, nómina y documentos.",
    color: "#C2185B",
    icon: Users,
    sections: [
      { slug: "empleados", name: "Empleados", icon: Users, implemented: true },
      { slug: "asistencia", name: "Asistencia", icon: CalendarCheck, implemented: false },
      { slug: "vacaciones", name: "Vacaciones", icon: Palmtree, implemented: false },
      { slug: "permisos-rrhh", name: "Permisos", icon: FileCheck, implemented: false },
      { slug: "nomina", name: "Nómina", icon: Banknote, implemented: false },
      { slug: "documentos-rrhh", name: "Documentos", icon: FolderArchive, implemented: false },
    ],
  },
  {
    slug: "operaciones",
    name: "Operaciones",
    description: "Proyectos, tareas, calendario, mantenimientos, órdenes de trabajo y seguimiento.",
    color: "#2E7D32",
    icon: FolderKanban,
    sections: [
      { slug: "proyectos", name: "Proyectos", icon: FolderKanban, implemented: true },
      { slug: "calendario", name: "Calendario", icon: CalendarDays, implemented: true },
      { slug: "piscina", name: "Piscina", icon: Waves, implemented: true },
      { slug: "tareas", name: "Tareas", icon: CheckSquare, implemented: false },
      { slug: "ordenes-trabajo", name: "Órdenes de trabajo", icon: Wrench, implemented: false },
      { slug: "seguimiento-operaciones", name: "Seguimiento", icon: Activity, implemented: false },
    ],
  },
  {
    slug: "activos",
    name: "Activos",
    description: "Flota vehicular, maquinaria, equipos, herramientas y mantenimiento de activos.",
    color: "#455A64",
    icon: Car,
    sections: [
      { slug: "flota", name: "Flota vehicular", icon: Car, implemented: false },
      { slug: "maquinaria", name: "Maquinaria", icon: Cog, implemented: false },
      { slug: "equipos", name: "Equipos", icon: HardHat, implemented: false },
      { slug: "herramientas", name: "Herramientas", icon: Hammer, implemented: false },
      { slug: "mantenimiento-activos", name: "Mantenimiento de activos", icon: Wrench, implemented: false },
    ],
  },
  {
    slug: "analitica",
    name: "Analítica",
    description: "Dashboard, KPIs, reportes, estadísticas e inteligencia de negocio.",
    color: "#00838F",
    icon: BarChart3,
    sections: [
      { slug: "dashboard-analitica", name: "Dashboard", icon: LayoutDashboard, implemented: false },
      { slug: "kpis", name: "KPIs", icon: Target, implemented: false },
      { slug: "reportes", name: "Reportes", icon: FileBarChart, implemented: false },
      { slug: "estadisticas", name: "Estadísticas", icon: BarChart3, implemented: false },
    ],
  },
  {
    slug: "administracion",
    name: "Administración",
    description: "Usuarios, roles, permisos, configuraciones, empresas, sucursales, integraciones y auditoría.",
    color: "#37474F",
    icon: Briefcase,
    sections: [
      { slug: "configuraciones", name: "Configuraciones", icon: Settings, implemented: true },
      { slug: "usuarios", name: "Usuarios", icon: UserCog, implemented: false },
      { slug: "roles-permisos", name: "Roles y permisos", icon: ShieldCheck, implemented: false },
      { slug: "empresas", name: "Empresas", icon: Building2, implemented: false },
      { slug: "sucursales", name: "Sucursales", icon: MapPin, implemented: false },
      { slug: "integraciones", name: "Integraciones", icon: Plug, implemented: false },
      { slug: "auditoria", name: "Auditoría", icon: History, implemented: false },
    ],
  },
];

export function getGroup(slug: string) {
  return appGroups.find((group) => group.slug === slug);
}
