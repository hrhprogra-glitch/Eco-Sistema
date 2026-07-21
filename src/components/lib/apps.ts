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
    slug: "resumen",
    name: "Gráficos",
    description: "Panel visual con gráficos y métricas clave del negocio.",
    color: "#5E35B1",
    icon: LineChart,
    sections: [
      { slug: "comercial", name: "Comercial", icon: LineChart, implemented: true },
      { slug: "finanzas", name: "Finanzas", icon: LineChart, implemented: true },
      { slug: "inventario", name: "Inventario", icon: LineChart, implemented: true },
      { slug: "analitica", name: "Analítica", icon: LineChart, implemented: true },
    ],
  },
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
    sections: [
      { slug: "rapida", name: "Salida rápida", icon: PackageMinus, implemented: true },
      { slug: "historial", name: "Historial", icon: PackageMinus, implemented: true },
    ],
  },
  {
    slug: "compras",
    name: "Compras",
    description: "Entradas de stock por factura de proveedor.",
    color: "#B8860B",
    icon: ShoppingCart,
    sections: [
      { slug: "compras", name: "Compras", icon: ShoppingCart, implemented: true },
      { slug: "proveedores", name: "Proveedores", icon: ShoppingCart, implemented: true },
    ],
  },
  {
    slug: "stock",
    name: "Stock",
    description: "Existencia actual por producto y almacén.",
    color: "#00695C",
    icon: Boxes,
    sections: [
      { slug: "productos", name: "Productos", icon: Boxes, implemented: true },
      { slug: "lotes", name: "Lotes", icon: Boxes, implemented: true },
    ],
  },
  {
    slug: "activos",
    name: "Activos",
    description: "Vehículos, herramientas y equipos: registro, mantenimiento y alertas de SOAT.",
    color: "#455A64",
    icon: Car,
    sections: [
      { slug: "nuevo-vehiculo", name: "Nuevo Vehículo", icon: Car, implemented: true },
      { slug: "nueva-herramienta", name: "Nueva Herramienta / Equipo", icon: Car, implemented: true },
      { slug: "nuevo-mantenimiento", name: "Registrar Mantenimiento", icon: Car, implemented: true },
    ],
  },
  {
    slug: "administracion",
    name: "Administración",
    description: "Usuarios, roles y permisos, empresas y sucursales, configuración e integraciones.",
    color: "#37474F",
    icon: Briefcase,
    sections: [
      { slug: "empleados", name: "Empleados", icon: Users, implemented: true },
      { slug: "usuarios", name: "Usuarios del Sistema", icon: UserCog, implemented: true },
      { slug: "permisos", name: "Permisos de Usuarios", icon: ShieldCheck, implemented: true },
    ],
  },
  {
    slug: "piscina",
    name: "Piscinas",
    description: "Piscinas, mantenimientos, controles químicos, equipos e historial.",
    color: "#0288D1",
    icon: Waves,
    sections: [
      { slug: "piscinas", name: "Piscinas", icon: Waves, implemented: true },
      { slug: "mantenimientos", name: "Mantenimientos", icon: Wrench, implemented: true },
      { slug: "equipos", name: "Equipos", icon: HardHat, implemented: true },
      { slug: "historial", name: "Historial", icon: History, implemented: true },
    ],
  },
];

export function getGroup(slug: string) {
  return appGroups.find((group) => group.slug === slug);
}
