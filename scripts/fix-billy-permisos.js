const { Client } = require('pg');
const client = new Client({connectionString: 'postgresql://harry:pollo1245@localhost:5432/eco_sistema'});
const ids = ['resumen', 'contacto', 'cotizaciones', 'calendario', 'salidas', 'compras', 'stock', 'activos', 'administracion', 'administracion.empleados', 'administracion.usuarios', 'administracion.permisos', 'piscina', 'piscina.piscinas', 'piscina.mantenimientos', 'piscina.equipos', 'piscina.historial'];

async function run() {
  await client.connect();
  const arrLiteral = '{' + ids.map(id => `"${id}"`).join(',') + '}';
  await client.query('UPDATE usuarios SET permisos = $1::TEXT[] WHERE username = $2', [arrLiteral, 'billy']);
  console.log('Updated billy permissions correctly.');
  await client.end();
}
run().catch(console.error);
