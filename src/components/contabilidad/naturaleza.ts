import type { TipoCuenta } from "./types";

// Activo y Gasto son cuentas de naturaleza deudora (su saldo crece con el Debe).
// Pasivo, Patrimonio e Ingreso son de naturaleza acreedora (su saldo crece con el Haber).
export function esNaturalezaDeudora(tipo: TipoCuenta) {
  return tipo === "activo" || tipo === "gasto";
}

export function movimientoNeto(tipo: TipoCuenta, debe: number, haber: number) {
  return esNaturalezaDeudora(tipo) ? debe - haber : haber - debe;
}
