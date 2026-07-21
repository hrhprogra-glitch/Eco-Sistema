const { Client } = require('pg');
const client = new Client({connectionString: 'postgresql://harry:pollo1245@localhost:5432/eco_sistema'});
async function run() {
  await client.connect();
  const res = await client.query("SELECT username, permisos FROM usuarios");
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
