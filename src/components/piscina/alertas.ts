import type { EventoCalendario } from "@/components/calendario/types";

function hoyISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function esEventoVencido(evento: EventoCalendario): boolean {
  return evento.estado === "pendiente" && evento.fecha < hoyISO();
}

export function esEventoProximo(evento: EventoCalendario, dias = 3): boolean {
  if (evento.estado !== "pendiente") return false;
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + dias);
  const fecha = new Date(`${evento.fecha}T00:00:00`);
  return fecha >= new Date(hoyISO()) && fecha <= limite;
}
