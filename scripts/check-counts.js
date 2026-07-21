const { Client } = require('pg');
const localDb = 'postgresql://harry:pollo1245@localhost:5432/eco_sistema';
const remoteDb = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function checkData() {
  const local = new Client({ connectionString: localDb });
  const remote = new Client({ connectionString: remoteDb });
  await local.connect();
  await remote.connect();

  const tables = ['entradas', 'productos', 'lotes', 'activos', 'proveedores', 'movimientos_stock'];

  for (const table of tables) {
    const lRes = await local.query(`SELECT COUNT(*) FROM "${table}"`);
    const rRes = await remote.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`Tabla ${table}: Local = ${lRes.rows[0].count}, Remote = ${rRes.rows[0].count}`);
  }

  await local.end();
  await remote.end();
}
checkData().catch(console.error);
