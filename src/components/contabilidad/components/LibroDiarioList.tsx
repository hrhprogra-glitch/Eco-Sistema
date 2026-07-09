import { DataTable, type Column } from "@/components/ui/DataTable";
import type { AsientoContable } from "../types";
import styles from "./LibroDiarioList.module.css";

type Row = AsientoContable & { total: number };

export function LibroDiarioList({
  asientos,
  onCreate,
  onSelect,
}: {
  asientos: AsientoContable[];
  onCreate: () => void;
  onSelect: (asiento: AsientoContable) => void;
}) {
  const rows: Row[] = asientos.map((a) => ({
    ...a,
    total: a.lineas.reduce((sum, l) => sum + Number(l.debe), 0),
  }));

  const columns: Column<Row>[] = [
    { key: "id", header: "N°", render: (a) => `ASI-${String(a.id).padStart(5, "0")}` },
    { key: "fecha", header: "Fecha", render: (a) => new Date(a.fecha).toLocaleDateString("es-PE") },
    { key: "descripcion", header: "Descripción" },
    {
      key: "total",
      header: "Total",
      render: (a) => <span className={styles.monto}>S/ {a.total.toFixed(2)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => (
        <span className={`${styles.badge} ${a.estado === "confirmado" ? styles.estadoConfirmado : styles.estadoBorrador}`}>
          {a.estado === "confirmado" ? "Confirmado" : "Borrador"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      onCreate={onCreate}
      onRowClick={onSelect}
      createLabel="Nuevo asiento"
      emptyMessage="No hay asientos contables registrados todavía."
    />
  );
}
