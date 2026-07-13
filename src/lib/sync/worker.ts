import { Pool } from "pg";
import {
  PRIMARY_KEYS,
  PULL_TABLE_ORDER,
  SYNC_INTERVAL_MS,
  MAX_ATTEMPTS,
  BATCH_SIZE,
  PULL_BATCH_SIZE,
} from "./config";

let localPool: Pool | undefined;
let cloudPool: Pool | undefined;
let timer: NodeJS.Timeout | undefined;
let running = false;

function buildUpsert(table: string, payload: Record<string, unknown>, pkCols: string[]) {
  const columns = Object.keys(payload);
  const values = columns.map((c) => payload[c]);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const nonPkColumns = columns.filter((c) => !pkCols.includes(c));
  const conflictTarget = pkCols.map((c) => `"${c}"`).join(", ");
  const setClause =
    nonPkColumns.length > 0
      ? `DO UPDATE SET ${nonPkColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ")}`
      : "DO NOTHING";
  // Last-write-wins: solo pisa la fila existente si la version entrante es
  // igual o mas nueva. Evita que un push/pull con datos viejos atropelle un
  // cambio mas reciente hecho del otro lado.
  const conflictClause =
    nonPkColumns.length > 0 && columns.includes("updated_at")
      ? `${setClause} WHERE "${table}".updated_at <= EXCLUDED.updated_at`
      : setClause;

  const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT (${conflictTarget}) ${conflictClause}`;
  return { sql, values };
}

function buildDelete(table: string, payload: Record<string, unknown>, pkCols: string[]) {
  const sql = `DELETE FROM "${table}" WHERE ${pkCols.map((c, i) => `"${c}" = $${i + 1}`).join(" AND ")}`;
  const values = pkCols.map((c) => payload[c]);
  return { sql, values };
}

async function checkConnectivity() {
  try {
    await cloudPool!.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function pushRow(row: { table_name: string; operation: string; payload: Record<string, unknown> }) {
  const pkCols = PRIMARY_KEYS[row.table_name];
  if (!pkCols) {
    throw new Error(`Tabla desconocida en outbox: ${row.table_name}`);
  }

  if (row.operation === "DELETE") {
    const { sql, values } = buildDelete(row.table_name, row.payload, pkCols);
    await cloudPool!.query(sql, values);
    const rowKey: Record<string, unknown> = {};
    for (const c of pkCols) rowKey[c] = row.payload[c];
    await cloudPool!.query(
      `INSERT INTO sync_tombstones (table_name, row_key) VALUES ($1, $2)`,
      [row.table_name, JSON.stringify(rowKey)]
    );
    return;
  }

  const { sql, values } = buildUpsert(row.table_name, row.payload, pkCols);
  await cloudPool!.query(sql, values);
}

async function pushPending() {
  const { rows } = await localPool!.query(
    `SELECT * FROM sync_outbox WHERE synced_at IS NULL AND attempts < $1 ORDER BY id ASC LIMIT $2`,
    [MAX_ATTEMPTS, BATCH_SIZE]
  );

  let anySuccess = false;

  for (const row of rows) {
    try {
      await pushRow(row);
      await localPool!.query(`UPDATE sync_outbox SET synced_at = now() WHERE id = $1`, [row.id]);
      anySuccess = true;
    } catch (err) {
      await localPool!.query(
        `UPDATE sync_outbox SET attempts = attempts + 1, last_error = $1 WHERE id = $2`,
        [String((err as Error).message || err), row.id]
      );
      break;
    }
  }

  return anySuccess;
}

async function applyLocally(sql: string, values: unknown[]) {
  const client = await localPool!.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL app.sync_apply = 'on'");
    await client.query(sql, values);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function pullChanges() {
  const { rows: nowRows } = await cloudPool!.query("SELECT now() AS now");
  const tickStart = nowRows[0].now;

  const { rows: stateRows } = await localPool!.query(`SELECT last_pull_at FROM sync_state WHERE id = true`);
  const lastPullAt = stateRows[0].last_pull_at;

  for (const table of PULL_TABLE_ORDER) {
    const pkCols = PRIMARY_KEYS[table];
    const { rows } = await cloudPool!.query(
      `SELECT * FROM "${table}" WHERE updated_at > $1 AND updated_at <= $2 ORDER BY updated_at ASC LIMIT $3`,
      [lastPullAt, tickStart, PULL_BATCH_SIZE]
    );

    for (const payload of rows) {
      const { sql, values } = buildUpsert(table, payload, pkCols);
      await applyLocally(sql, values);
    }
  }

  const { rows: tombstones } = await cloudPool!.query(
    `SELECT table_name, row_key FROM sync_tombstones WHERE deleted_at > $1 AND deleted_at <= $2 ORDER BY deleted_at ASC LIMIT $3`,
    [lastPullAt, tickStart, PULL_BATCH_SIZE]
  );

  for (const tomb of tombstones) {
    const pkCols = PRIMARY_KEYS[tomb.table_name];
    if (!pkCols) continue;
    const { sql, values } = buildDelete(tomb.table_name, tomb.row_key, pkCols);
    await applyLocally(sql, values);
  }

  await localPool!.query(`UPDATE sync_state SET last_pull_at = $1 WHERE id = true`, [tickStart]);
}

async function syncTick() {
  if (running) return;
  running = true;

  try {
    const isOnline = await checkConnectivity();
    await localPool!.query(
      `UPDATE sync_state SET is_online = $1, last_check_at = now() WHERE id = true`,
      [isOnline]
    );

    if (!isOnline) return;

    await pushPending();
    await pullChanges();
    await localPool!.query(`UPDATE sync_state SET last_success_at = now() WHERE id = true`);
  } catch (err) {
    console.error("[sync] error en syncTick:", (err as Error).message || err);
  } finally {
    running = false;
  }
}

export function start({
  localConnectionString,
  cloudConnectionString,
}: {
  localConnectionString: string;
  cloudConnectionString: string;
}) {
  localPool = new Pool({ connectionString: localConnectionString });
  cloudPool = new Pool({ connectionString: cloudConnectionString, connectionTimeoutMillis: 8000 });

  syncTick();
  timer = setInterval(syncTick, SYNC_INTERVAL_MS);
}

export async function stop() {
  if (timer) clearInterval(timer);
  if (localPool) await localPool.end();
  if (cloudPool) await cloudPool.end();
}
