const { Client } = require('pg');

const localDb = 'postgresql://harry:pollo1245@localhost:5432/eco_sistema';
const remoteDb = 'postgresql://postgres.cyuvpxcttsfmacyyushd:leY4k5gZXsV7WIhf@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

async function sync() {
  const local = new Client({ connectionString: localDb });
  const remote = new Client({ connectionString: remoteDb });

  await local.connect();
  await remote.connect();

  console.log("Iniciando sincronización de datos Local -> Supabase...");

  try {
    // 1. Obtener todas las tablas del esquema public en Local
    const res = await local.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = res.rows.map(r => r.table_name);
    console.log(`Encontradas ${tables.length} tablas para sincronizar.`);

    // 2. Desactivar validación de FKs en Supabase para evitar errores de orden de inserción
    await remote.query("SET session_replication_role = 'replica';");
    console.log("Desactivadas restricciones de llaves foráneas temporalmente en Supabase.");

    for (const table of tables) {
      console.log(`Procesando tabla: ${table}...`);
      
      // Vaciar la tabla remota
      await remote.query(`TRUNCATE TABLE "${table}" CASCADE;`);

      // Traer los datos locales
      const data = await local.query(`SELECT * FROM "${table}";`);
      
      if (data.rows.length === 0) {
        console.log(`  - La tabla ${table} está vacía. Saltando.`);
        continue;
      }

      // Insertar datos en bloques (batches)
      const rows = data.rows;
      const columns = Object.keys(rows[0]);
      const colStr = columns.map(c => `"${c}"`).join(', ');

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const values = columns.map(c => row[c]);
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        
        try {
          await remote.query(
            `INSERT INTO "${table}" (${colStr}) VALUES (${placeholders})`,
            values
          );
        } catch (err) {
          console.error(`  - Error insertando fila en ${table}:`, err.message);
        }
      }

      console.log(`  - Insertadas ${rows.length} filas en ${table}.`);
    }

    // 3. Reactivar validación de FKs
    await remote.query("SET session_replication_role = 'origin';");
    console.log("\nSincronización finalizada con éxito.");

  } catch (error) {
    console.error("Ocurrió un error en la sincronización:", error);
  } finally {
    await local.end();
    await remote.end();
  }
}

sync();
