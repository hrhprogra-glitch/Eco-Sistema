const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const connectionString = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  console.log('Conectado a Supabase...');
  
  // Ejecutamos desde la 028 en adelante por si faltan tablas
  const filesToRun = [
    '028_activos.sql',
    '029_activos_vehiculos.sql',
    '030_roles.sql',
    '031_usuarios_permisos.sql',
    '032_usuarios_password_plain.sql'
  ];

  for (const file of filesToRun) {
    try {
      const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', file), 'utf8');
      console.log(`Aplicando ${file}...`);
      await client.query(sql);
      console.log(`Exito: ${file}`);
    } catch (e) {
      console.log(`Error al aplicar ${file}: ${e.message}`);
    }
  }

  // Ahora sí, asignar los permisos y resetear la contraseña
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

  const hash = await bcrypt.hash('admin123', 10);
  await client.query('UPDATE usuarios SET password_hash = $1 WHERE username IN ($2, $3)', [hash, 'harry', 'billy']);
  console.log('Contraseñas reseteadas a admin123.');

  const arrLiteral = '{' + ids.map(id => `"${id}"`).join(',') + '}';
  await client.query('UPDATE usuarios SET permisos = $1::TEXT[] WHERE username IN ($2, $3)', [arrLiteral, 'harry', 'billy']);
  console.log('Permisos asignados a harry y billy.');

  await client.end();
}

run().catch(console.error);
