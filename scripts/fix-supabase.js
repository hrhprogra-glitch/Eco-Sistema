const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Conectamos a Supabase usando la URL de .env.local
const connectionString = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString });

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
  console.log('Conectado a Supabase...');
  
  // 1. Resetear contraseñas a admin123
  const hash = await bcrypt.hash('admin123', 10);
  await client.query('UPDATE usuarios SET password_hash = $1 WHERE username IN ($2, $3)', [hash, 'harry', 'billy']);
  console.log('Contraseñas de harry y billy reseteadas a admin123 en Supabase.');
  
  // 2. Asignar todos los permisos
  const arrLiteral = '{' + ids.map(id => `"${id}"`).join(',') + '}';
  await client.query('UPDATE usuarios SET permisos = $1::TEXT[] WHERE username IN ($2, $3)', [arrLiteral, 'harry', 'billy']);
  console.log('Permisos asignados a harry y billy en Supabase.');
  
  await client.end();
}

run().catch(err => {
  console.error("Error conectando a Supabase:", err);
  process.exit(1);
});
