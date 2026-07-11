export type Identificacion = {
  tipo: string;
  numero: string;
};

export type Direccion = {
  calle: string;
  calle2: string;
  distrito: string;
  ciudad: string;
  estado: string;
  zip: string;
  pais: string;
};

export type Contacto = {
  id: string;
  nombre: string;
  tipo: "cliente" | "proveedor" | "otro";
  esEmpresa: boolean;
  email: string;
  telefono: string;
  sitioWeb: string;
  puestoTrabajo: string;
  codigo?: string;
  nombreFiscal?: string;
  fax?: string;
  movil?: string;
  personaContacto?: string;
  nif?: string;
  agente?: string;
  tipoCliente?: string;
  direccion: Direccion;
  identificaciones: Identificacion[];
  etiquetas: string[];
  contactosRelacionados: string[];
  notas: string;
  created_at: string;
};

export type ContactoTables = {
  contactos: {
    Row: Contacto;
    Insert: Omit<Contacto, "id" | "created_at"> & Partial<Pick<Contacto, "id" | "created_at">>;
    Update: Partial<Contacto>;
  };
};
