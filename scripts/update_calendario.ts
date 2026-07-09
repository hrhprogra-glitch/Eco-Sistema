
import { query } from "../src/lib/db";

async function main() {
  try {
    console.log("Adding columns to calendario_eventos...");
    await query(`
      ALTER TABLE calendario_eventos 
      ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'nota',
      ADD COLUMN IF NOT EXISTS trabajadores TEXT;
    `);
    console.log("Successfully added columns!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
