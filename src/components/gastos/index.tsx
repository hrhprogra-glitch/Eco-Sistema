import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { GastoPlaceholder } from "./components/GastoPlaceholder";

const app = getApp("gastos")!;

export default function GastosModule() {
  return (
    <ModuleLayout app={app}>
      <GastoPlaceholder />
    </ModuleLayout>
  );
}
