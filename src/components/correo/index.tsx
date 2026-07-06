import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { MensajePlaceholder } from "./components/MensajePlaceholder";

const app = getApp("correo")!;

export default function CorreoModule() {
  return (
    <ModuleLayout app={app}>
      <MensajePlaceholder />
    </ModuleLayout>
  );
}
