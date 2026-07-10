import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { CuentaContable, TipoCuenta } from "../types";
import styles from "./PlanCuentasList.module.css";

const TIPO_BADGE: Record<TipoCuenta, string> = {
  activo: styles.tipoActivo,
  pasivo: styles.tipoPasivo,
  patrimonio: styles.tipoPatrimonio,
  ingreso: styles.tipoIngreso,
  gasto: styles.tipoGasto,
};

export function PlanCuentasList({
  cuentas,
  onCreate,
  onSelect,
  onDelete,
}: {
  cuentas: CuentaContable[];
  onCreate: () => void;
  onSelect: (cuenta: CuentaContable) => void;
  onDelete: (id: string) => void;
}) {
  const columns: Column<CuentaContable>[] = [
    { key: "codigo", header: "Código" },
    { key: "nombre", header: "Nombre" },
    {
      key: "tipo",
      header: "Tipo",
      render: (c) => <span className={`${styles.badge} ${TIPO_BADGE[c.tipo]}`}>{c.tipo}</span>,
    },
    {
      key: "id",
      header: "",
      render: (c) => (
        <button
          type="button"
          className={styles.deleteBtn}
          title="Eliminar cuenta"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(c.id);
          }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={cuentas}
      columns={columns}
      onCreate={onCreate}
      onRowClick={onSelect}
      createLabel="Nueva cuenta"
      emptyMessage="No hay cuentas en el plan contable todavía."
    />
  );
}
