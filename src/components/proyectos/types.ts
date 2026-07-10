export interface Proyecto {
  id: string;
  nombre: string;
  estado: string;
  created_at: string;
  empleados?: any[];
  items?: ProyectoItem[];
}

export interface ProyectoItem {
  id: string;
  proyecto_id: string;
  producto_id: string | null;
  nombre_externo: string | null;
  cantidad: number;
  justificacion: string | null;
  created_at: string;
  producto_nombre?: string;
  producto_foto?: string;
}

export interface CalendarioEvento {
  id: string;
  titulo: string;
  fecha: string;
  descripcion: string | null;
  proyecto_id: string | null;
  created_at: string;
}
