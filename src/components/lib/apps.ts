export type AppModule = {
  slug: string;
  name: string;
  description: string;
  color: string;
  category: string;
};

export const apps: AppModule[] = [
  {
    slug: "ventas",
    name: "Ventas",
    description: "Cotizaciones, pedidos y seguimiento de clientes.",
    color: "#714B67",
    category: "Comercial",
  },
  {
    slug: "crm",
    name: "CRM",
    description: "Oportunidades, leads y pipeline comercial.",
    color: "#00A09D",
    category: "Comercial",
  },
  {
    slug: "facturacion",
    name: "Facturación",
    description: "Facturas, pagos y documentos fiscales.",
    color: "#9C5FBB",
    category: "Finanzas",
  },
  {
    slug: "contabilidad",
    name: "Contabilidad",
    description: "Libros contables, impuestos y reportes financieros.",
    color: "#2C5F9E",
    category: "Finanzas",
  },
  {
    slug: "gastos",
    name: "Gastos",
    description: "Registro y aprobación de gastos del equipo.",
    color: "#D5232A",
    category: "Finanzas",
  },
  {
    slug: "inventario",
    name: "Inventario",
    description: "Stock, almacenes y movimientos de productos.",
    color: "#B8860B",
    category: "Operaciones",
  },
  {
    slug: "proyectos",
    name: "Proyectos",
    description: "Tareas, hitos y planificación de equipos.",
    color: "#2E7D32",
    category: "Operaciones",
  },
  {
    slug: "empleados",
    name: "Empleados",
    description: "Legajos, nómina y gestión de personal.",
    color: "#C2185B",
    category: "Recursos Humanos",
  },
  {
    slug: "correo",
    name: "Correo electrónico",
    description: "Bandeja de entrada y comunicaciones del negocio.",
    color: "#0288D1",
    category: "Sistema",
  },
  {
    slug: "contacto",
    name: "Contacto",
    description: "Directorio de clientes, proveedores y contactos.",
    color: "#546E7A",
    category: "Comercial",
  },
  {
    slug: "piscina",
    name: "Piscina",
    description: "Mantenimiento, control químico y estado de piscinas.",
    color: "#0097A7",
    category: "Operaciones",
  },
  {
    slug: "configuraciones",
    name: "Configuraciones",
    description: "Preferencias generales y parámetros del sistema.",
    color: "#455A64",
    category: "Sistema",
  },
  {
    slug: "calendario",
    name: "Calendario",
    description: "Programación de proyectos y mantenimientos.",
    color: "#F57C00",
    category: "Operaciones",
  },
];

export function getApp(slug: string) {
  return apps.find((app) => app.slug === slug);
}
