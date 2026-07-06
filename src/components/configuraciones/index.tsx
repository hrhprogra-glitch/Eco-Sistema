import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { ConfiguracionPlaceholder } from "./components/ConfiguracionPlaceholder";

const app = getApp("configuraciones")!;

export default function ConfiguracionesModule() {
  return (
    <ModuleLayout app={app}>
      <ConfiguracionPlaceholder />
    </ModuleLayout>
  );
}
