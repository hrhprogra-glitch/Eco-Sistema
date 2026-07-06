import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { VentaPlaceholder } from "./components/VentaPlaceholder";

const app = getApp("ventas")!;

export default function VentasModule() {
  return (
    <ModuleLayout app={app}>
      <VentaPlaceholder />
    </ModuleLayout>
  );
}
