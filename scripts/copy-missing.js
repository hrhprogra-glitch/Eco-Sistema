const { Client } = require('pg');
const localDb = 'postgresql://harry:pollo1245@localhost:5432/eco_sistema';
const remoteDb = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function copy() {
  const local = new Client({ connectionString: localDb });
  const remote = new Client({ connectionString: remoteDb });
  await local.connect();
  await remote.connect();

  await remote.query("SET session_replication_role = 'replica';");

  const tables = ['entradas', 'entrada_lineas', 'lotes'];

  for (const table of tables) {
    const data = await local.query(`SELECT * FROM "${table}"`);
    console.log(`Copying ${data.rows.length} rows for ${table}...`);
    
    if (data.rows.length > 0) {
      await remote.query(`TRUNCATE TABLE "${table}" CASCADE`);
      const columns = Object.keys(data.rows[0]);
      const colStr = columns.map(c => `"${c}"`).join(', ');
      
      for (const row of data.rows) {
        const values = columns.map(c => row[c]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        try {
          await remote.query(`INSERT INTO "${table}" (${colStr}) VALUES (${placeholders})`, values);
        } catch(e) {
          console.error(`Error in ${table}:`, e.message);
        }
      }
    }
  }

  await remote.query("SET session_replication_role = 'origin';");
  
  for (const table of tables) {
    const rRes = await remote.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`Result ${table}: ${rRes.rows[0].count} rows in remote.`);
  }

  await local.end();
  await remote.end();
}
copy().catch(console.error);
