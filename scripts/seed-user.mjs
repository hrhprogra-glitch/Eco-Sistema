import bcrypt from "bcryptjs";
import { Pool } from "pg";

const [, , username, password, nombreCompleto] = process.argv;

if (!username || !password) {
  console.error("Uso: node scripts/seed-user.mjs <username> <password> [nombre completo]");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const passwordHash = await bcrypt.hash(password, 10);

await pool.query(
  `INSERT INTO usuarios (username, password_hash, nombre_completo)
   VALUES ($1, $2, $3)
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, nombre_completo = EXCLUDED.nombre_completo`,
  [username, passwordHash, nombreCompleto ?? username]
);

console.log(`Usuario "${username}" creado/actualizado correctamente.`);
await pool.end();
