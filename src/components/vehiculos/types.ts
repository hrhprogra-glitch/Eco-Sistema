export type Vehiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  estado: "activo" | "en_mantenimiento" | "de_baja";
  created_at: string;
};

export type VehiculosTables = {
  vehiculos: {
    Row: Vehiculo;
    Insert: Omit<Vehiculo, "id" | "created_at"> & Partial<Pick<Vehiculo, "id" | "created_at">>;
    Update: Partial<Vehiculo>;
  };
};
