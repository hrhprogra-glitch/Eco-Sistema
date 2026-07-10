import type { Contacto } from "./types";

export function createEmptyContacto(): Contacto {
  return {
    id: "",
    nombre: "",
    tipo: "cliente",
    esEmpresa: true,
    email: "",
    telefono: "",
    sitioWeb: "",
    puestoTrabajo: "",
    direccion: {
      calle: "",
      calle2: "",
      distrito: "",
      ciudad: "",
      estado: "",
      zip: "",
      pais: "",
    },
    identificaciones: [],
    etiquetas: [],
    contactosRelacionados: [],
    notas: "",
    created_at: new Date().toISOString(),
  };
}
