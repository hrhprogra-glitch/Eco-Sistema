export type TipoActivo = 'vehiculo' | 'equipo' | 'herramienta';
export type EstadoActivo = 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
export type TipoVehiculo = 'auto' | 'camioneta' | 'camion' | 'moto' | 'otro';

export type Activo = {
  id: string;
  tipo: TipoActivo;
  nombre: string;
  identificador: string | null;
  estado: EstadoActivo;
  fecha_adquisicion: string | null;
  asignado_a: string | null;
  notas: string | null;
  tipo_vehiculo: TipoVehiculo | null;
  soat_vencimiento: string | null;
  /** Fecha programada del mantenimiento pendiente más próximo (calculado en el SELECT, no una columna). */
  proximo_mantenimiento?: string | null;
  created_at: string;
  updated_at: string;
};

export type MantenimientoActivo = {
  id: string;
  activo_id: string;
  activo_nombre?: string; // del JOIN
  activo_tipo?: string; // del JOIN
  tipo_mantenimiento: 'preventivo' | 'correctivo';
  fecha_programada: string | null;
  fecha_realizada: string | null;
  costo: number | null;
  descripcion: string | null;
  estado: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
  updated_at: string;
};
