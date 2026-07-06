import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { OportunidadPlaceholder } from "./components/OportunidadPlaceholder";

const app = getApp("crm")!;

export default function CrmModule() {
  return (
    <ModuleLayout app={app}>
      <OportunidadPlaceholder />
    </ModuleLayout>
  );
}
