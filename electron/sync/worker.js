const { Pool } = require("pg");
const { PRIMARY_KEYS, SYNC_INTERVAL_MS, MAX_ATTEMPTS, BATCH_SIZE } = require("./config");

let localPool;
let cloudPool;
let timer;
let running = false;

function buildUpsert(table, payload, pkCols) {
  const columns = Object.keys(payload);
  const values = columns.map((c) => payload[c]);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const nonPkColumns = columns.filter((c) => !pkCols.includes(c));
  const conflictTarget = pkCols.map((c) => `"${c}"`).join(", ");
  const setClause =
    nonPkColumns.length > 0
      ? `DO UPDATE SET ${nonPkColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ")}`
      : "DO NOTHING";

  const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT (${conflictTarget}) ${setClause}`;
  return { sql, values };
}

function buildDelete(table, payload, pkCols) {
  const sql = `DELETE FROM "${table}" WHERE ${pkCols.map((c, i) => `"${c}" = $${i + 1}`).join(" AND ")}`;
  const values = pkCols.map((c) => payload[c]);
  return { sql, values };
}

async function checkConnectivity() {
  try {
    await cloudPool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function pushRow(row) {
  const pkCols = PRIMARY_KEYS[row.table_name];
  if (!pkCols) {
    throw new Error(`Tabla desconocida en outbox: ${row.table_name}`);
  }

  const { sql, values } =
    row.operation === "DELETE"
      ? buildDelete(row.table_name, row.payload, pkCols)
      : buildUpsert(row.table_name, row.payload, pkCols);

  await cloudPool.query(sql, values);
}

async function syncTick() {
  if (running) return;
  running = true;

  try {
    const isOnline = await checkConnectivity();
    await localPool.query(
      `UPDATE sync_state SET is_online = $1, last_check_at = now() WHERE id = true`,
      [isOnline]
    );

    if (!isOnline) return;

    const { rows } = await localPool.query(
      `SELECT * FROM sync_outbox WHERE synced_at IS NULL AND attempts < $1 ORDER BY id ASC LIMIT $2`,
      [MAX_ATTEMPTS, BATCH_SIZE]
    );

    let anySuccess = false;

    for (const row of rows) {
      try {
        await pushRow(row);
        await localPool.query(`UPDATE sync_outbox SET synced_at = now() WHERE id = $1`, [row.id]);
        anySuccess = true;
      } catch (err) {
        await localPool.query(
          `UPDATE sync_outbox SET attempts = attempts + 1, last_error = $1 WHERE id = $2`,
          [String(err.message || err), row.id]
        );
        break;
      }
    }

    if (anySuccess) {
      await localPool.query(`UPDATE sync_state SET last_success_at = now() WHERE id = true`);
    }
  } catch (err) {
    console.error("[sync] error en syncTick:", err.message || err);
  } finally {
    running = false;
  }
}

function start({ localConnectionString, cloudConnectionString }) {
  localPool = new Pool({ connectionString: localConnectionString });
  cloudPool = new Pool({ connectionString: cloudConnectionString, connectionTimeoutMillis: 8000 });

  syncTick();
  timer = setInterval(syncTick, SYNC_INTERVAL_MS);
}

async function stop() {
  if (timer) clearInterval(timer);
  if (localPool) await localPool.end();
  if (cloudPool) await cloudPool.end();
}

module.exports = { start, stop };
