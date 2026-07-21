const { Client } = require('pg');
const localDb = 'postgresql://harry:pollo1245@localhost:5432/eco_sistema';
const remoteDb = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function testReplica() {
  const client = new Client({ connectionString: remoteDb });
  await client.connect();
  try {
    await client.query("SET session_replication_role = 'replica';");
    console.log("SUCCESS: session_replication_role set to replica.");
  } catch(e) {
    console.error("FAIL:", e.message);
  } finally {
    await client.end();
  }
}
testReplica();
