import { createClient } from "@supabase/supabase-js";

import type { VentasTables } from "@/components/ventas/types";
import type { CrmTables } from "@/components/crm/types";
import type { FacturacionTables } from "@/components/facturacion/types";
import type { ContabilidadTables } from "@/components/contabilidad/types";
import type { GastosTables } from "@/components/gastos/types";
import type { InventarioTables } from "@/components/inventario/types";
import type { ProyectosTables } from "@/components/proyectos/types";
import type { EmpleadosTables } from "@/components/empleados/types";
import type { CorreoTables } from "@/components/correo/types";
import type { ContactoTables } from "@/components/contacto/types";
import type { PiscinaTables } from "@/components/piscina/types";
import type { ConfiguracionesTables } from "@/components/configuraciones/types";

export type Database = {
  public: {
    Tables: VentasTables &
      CrmTables &
      FacturacionTables &
      ContabilidadTables &
      GastosTables &
      InventarioTables &
      ProyectosTables &
      EmpleadosTables &
      CorreoTables &
      ContactoTables &
      PiscinaTables &
      ConfiguracionesTables;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
