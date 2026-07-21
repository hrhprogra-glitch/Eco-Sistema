export type Empleado = {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  foto_url: string | null;
  email_trabajo: string | null;
  telefono_trabajo: string | null;
  jefe_directo: string | null;
  dni: string | null;
  dni_foto_url: string | null;
  monto_pago: number | null;
  created_at: string;
  updated_at: string;
};
