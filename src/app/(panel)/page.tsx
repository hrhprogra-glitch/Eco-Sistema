import { getSession } from "@/lib/auth";
import { DashboardClient } from "../DashboardClient";

export default async function Home() {
  const session = await getSession();
  const firstName = session?.username?.split(/[.\s_]/)[0] ?? null;

  return <DashboardClient firstName={firstName} />;
}
