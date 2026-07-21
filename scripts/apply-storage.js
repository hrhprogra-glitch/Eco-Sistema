const { Client } = require('pg');
const fs = require('fs');

const localDb = 'postgresql://harry:pollo1245@localhost:5432/eco_sistema';
const remoteDb = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function run() {
  const sql = fs.readFileSync('sql/033_storage_facturas.sql', 'utf8');

  // Local
  const local = new Client({ connectionString: localDb });
  await local.connect();
  try {
    await local.query(sql);
    console.log("Local OK");
  } catch (e) {
    console.log("Local Error (tal vez falte esquema storage local, ignorar si es el caso):", e.message);
  } finally {
    await local.end();
  }

  // Remote
  const remote = new Client({ connectionString: remoteDb });
  await remote.connect();
  try {
    await remote.query(sql);
    console.log("Remote OK");
  } catch (e) {
    console.log("Remote Error:", e.message);
  } finally {
    await remote.end();
  }
}

run().catch(console.error);
