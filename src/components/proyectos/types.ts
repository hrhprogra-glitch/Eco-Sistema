export interface Proyecto {
  id: number;
  nombre: string;
  estado: string;
  created_at: string;
  empleados?: any[];
  items?: ProyectoItem[];
}

export interface ProyectoItem {
  id: number;
  proyecto_id: number;
  producto_id: number | null;
  nombre_externo: string | null;
  cantidad: number;
  justificacion: string | null;
  created_at: string;
  producto_nombre?: string;
  producto_foto?: string;
}

export interface CalendarioEvento {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string | null;
  proyecto_id: number | null;
  created_at: string;
}
