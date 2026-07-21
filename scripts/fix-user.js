const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const client = new Client({connectionString: 'postgresql://harry:pollo1245@localhost:5432/eco_sistema'});
async function run() {
  await client.connect();
  const hash = await bcrypt.hash('admin123', 10);
  const result = await client.query('UPDATE usuarios SET password_hash = $1 WHERE username = $2', [hash, 'billy']);
  if (result.rowCount > 0) {
    console.log('Password for billy reset to admin123.');
  } else {
    console.log('User billy not found!');
  }
  await client.end();
}
run().catch(console.error);
