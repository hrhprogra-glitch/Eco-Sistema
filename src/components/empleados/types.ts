export type Empleado = {
  id: number;
  nombre: string;
  puesto: string;
  area: string;
  foto_url: string | null;
  email_trabajo: string | null;
  telefono_trabajo: string | null;
  jefe_directo: string | null;
  dni: string | null;
  dni_foto_url: string | null;
  monto_pago: number;
  created_at: string;
};

export type EmpleadosTables = {
  empleados: {
    Row: Empleado;
    Insert: Omit<Empleado, "id" | "created_at"> & Partial<Pick<Empleado, "id" | "created_at">>;
    Update: Partial<Empleado>;
  };
};
