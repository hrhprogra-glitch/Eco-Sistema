// Cuentas de acceso a la app (login de eco-sistema), NO empleados de la empresa.
// Ese es un concepto aparte que vive en `@/components/empleados`.

/** Fila tal como la devuelve la API: nunca trae `password_hash`. */
export type Usuario = {
  id: string;
  username: string;
  nombre_completo: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Datos que maneja el formulario antes de enviarlos a la API. `password` viaja
 * en memoria del cliente mientras se completa el formulario, pero nunca se
 * persiste tal cual (la API la hashea) ni vuelve a aparecer en ninguna respuesta.
 */
export type UsuarioFormValues = {
  username: string;
  nombre_completo: string;
  /** Requerida al crear; vacía y opcional al editar (solo se envía si se completa). */
  password: string;
};
