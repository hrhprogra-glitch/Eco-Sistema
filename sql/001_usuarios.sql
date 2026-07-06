CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre_completo VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
