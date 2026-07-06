import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { AsientoContablePlaceholder } from "./components/AsientoContablePlaceholder";

const app = getApp("contabilidad")!;

export default function ContabilidadModule() {
  return (
    <ModuleLayout app={app}>
      <AsientoContablePlaceholder />
    </ModuleLayout>
  );
}
