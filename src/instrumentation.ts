const globalForSync = globalThis as unknown as { syncWorkerStarted?: boolean };

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (globalForSync.syncWorkerStarted) return;

  const { DATABASE_URL, SUPABASE_DATABASE_URL } = process.env;
  if (!DATABASE_URL || !SUPABASE_DATABASE_URL) {
    console.warn("[sync] faltan DATABASE_URL/SUPABASE_DATABASE_URL en .env.local, el worker no arranca");
    return;
  }

  const syncWorker = await import("@/lib/sync/worker");
  syncWorker.start({
    localConnectionString: DATABASE_URL,
    cloudConnectionString: SUPABASE_DATABASE_URL,
  });

  globalForSync.syncWorkerStarted = true;
}
