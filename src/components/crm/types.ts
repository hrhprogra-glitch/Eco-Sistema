export type EtapaOportunidad = "nuevo" | "calificado" | "propuesta" | "ganado" | "perdido";

export type Oportunidad = {
  id: string;
  titulo: string;
  contacto_id: string;
  contacto_nombre?: string;
  etapa: EtapaOportunidad;
  monto_estimado: number;
  notas: string;
  created_at: string;
};

export type OportunidadInput = Omit<Oportunidad, "id" | "created_at" | "contacto_nombre">;
