import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

type SyncStatusRow = {
  pending: string;
  failed: string;
  is_online: boolean | null;
  last_success_at: string | null;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<SyncStatusRow>(
    `SELECT
       (SELECT count(*) FROM sync_outbox WHERE synced_at IS NULL AND attempts < 5) AS pending,
       (SELECT count(*) FROM sync_outbox WHERE synced_at IS NULL AND attempts >= 5) AS failed,
       s.is_online,
       s.last_success_at
     FROM sync_state s
     WHERE s.id = true`
  );

  const row = result.rows[0];
  return NextResponse.json({
    pending: row ? Number(row.pending) : 0,
    failed: row ? Number(row.failed) : 0,
    isOnline: row?.is_online ?? false,
    lastSuccessAt: row?.last_success_at ?? null,
  });
}
