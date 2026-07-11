export type DashboardWidget = {
  id: string;
  titulo: string;
  tipo: string;
  orden: number;
  created_at: string;
};

export type DashboardAnaliticaTables = {
  dashboard_widgets: {
    Row: DashboardWidget;
    Insert: Omit<DashboardWidget, "id" | "created_at"> & Partial<Pick<DashboardWidget, "id" | "created_at">>;
    Update: Partial<DashboardWidget>;
  };
};
