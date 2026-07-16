import type { LineaItem } from "@/components/ui/LineaItemsEditor";

export type EstadoCotizacion = "borrador" | "enviada" | "aceptada" | "rechazada" | "confirmada" | "cancelada";
export type MonedaCotizacion = "PEN" | "USD";

// "tarjetas" es el modelo estructurado (Producto/Descripción) que se usa al armar una
// cotización a mano. "libre" es para las importadas desde Word: el contenido detectado se
// edita directo sobre la hoja como texto libre por fila (ver LineasLibres), sin forzarlo a
// los campos rígidos de una tarjeta -evita el desajuste de intentar "adivinar" cantidad/
// producto en un documento que nunca tuvo esa estructura-.
export type LineasModo = "tarjetas" | "libre";

export type FilaLibre = {
  id: string;
  html: string;
  precio: string;
};

export type LineasLibres = {
  cantidad: string;
  filas: FilaLibre[];
  total: string;
};

export type Cotizacion = {
  id: string;
  numero: number;
  contacto_id: string;
  contacto_nombre?: string;
  total: number;
  estado: EstadoCotizacion;
  moneda: MonedaCotizacion;
  fecha: string;
  notas?: string;
  created_at: string;
  lineas_detalle?: LineaItem[];
  lineas_modo?: LineasModo;
  lineas_libres?: LineasLibres | null;
};

export type CotizacionInput = Omit<Cotizacion, "id" | "numero" | "created_at" | "contacto_nombre" | "total"> & {
  total?: number;
};
