const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const sql = fs.readFileSync('sql/032_usuarios_password_plain.sql', 'utf8');
  const client = new Client({
    connectionString: "postgresql://harry:pollo1245@localhost:5432/eco_sistema"
  });
  
  try {
    await client.connect();
    await client.query(sql);
    console.log("SQL schema 032 applied successfully.");
  } catch (err) {
    console.error("Error applying SQL schema:", err);
  } finally {
    await client.end();
  }
}

main();
