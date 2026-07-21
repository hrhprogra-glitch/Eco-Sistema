const { Client } = require('pg');
const client = new Client({connectionString: 'postgresql://harry:pollo1245@localhost:5432/eco_sistema'});
const ids = [
  'resumen', 'resumen.comercial', 'resumen.finanzas', 'resumen.inventario', 'resumen.analitica',
  'contacto', 
  'cotizaciones', 
  'calendario', 
  'salidas', 'salidas.rapida', 'salidas.historial',
  'compras', 'compras.compras', 'compras.proveedores',
  'stock', 'stock.productos', 'stock.lotes',
  'activos', 'activos.nuevo-vehiculo', 'activos.nueva-herramienta', 'activos.nuevo-mantenimiento',
  'administracion', 'administracion.empleados', 'administracion.usuarios', 'administracion.permisos',
  'piscina', 'piscina.piscinas', 'piscina.mantenimientos', 'piscina.equipos', 'piscina.historial',
  'recursos-humanos', 'operaciones', 'analitica'
];

async function run() {
  await client.connect();
  const arrLiteral = '{' + ids.map(id => `"${id}"`).join(',') + '}';
  await client.query('UPDATE usuarios SET permisos = $1::TEXT[] WHERE username IN ($2, $3)', [arrLiteral, 'harry', 'billy']);
  console.log('Updated harry and billy permissions correctly.');
  await client.end();
}
run().catch(console.error);
