import { UserPlus, Handshake, FileText, CalendarDays, type LucideIcon } from "lucide-react";
import type { ModuleAction } from "@/components/ui/ModuleActions";

export type ComercialSession = "contacto" | "crm" | "cotizaciones" | "calendario";

const NUEVO_POR_SESION: Record<ComercialSession, { label: string; icon: LucideIcon }> = {
  contacto: { label: "Nuevo contacto", icon: UserPlus },
  crm: { label: "Nueva oportunidad", icon: Handshake },
  cotizaciones: { label: "Nueva cotización", icon: FileText },
  calendario: { label: "Nuevo evento", icon: CalendarDays },
};

/** Cada sesión de Comercial muestra un único botón dinámico: el de crear su propio registro. */
export function buildComercialActions(session: ComercialSession, onCreate: () => void): ModuleAction[] {
  const { label, icon } = NUEVO_POR_SESION[session];
  return [{ key: "nuevo", label, icon, tone: "primary", onClick: onCreate }];
}
