const { Client } = require('pg');
const connectionString = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function check() {
  const client = new Client({ connectionString });
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log("Tablas en Supabase:", res.rows.map(r => r.table_name).join(", "));
  await client.end();
}

check().catch(console.error);
