import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { FacturaPlaceholder } from "./components/FacturaPlaceholder";

const app = getApp("facturacion")!;

export default function FacturacionModule() {
  return (
    <ModuleLayout app={app}>
      <FacturaPlaceholder />
    </ModuleLayout>
  );
}
