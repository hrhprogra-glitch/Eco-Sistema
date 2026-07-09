# Base de datos

`eco_sistema_dump.sql` es un backup completo (esquema + datos) de la base de datos
PostgreSQL local `eco_sistema`, generado con `pg_dump`. Sirve para levantar la misma
base en otra máquina (por ejemplo una laptop fuera de casa).

## Restaurar en otra máquina

1. Instalar PostgreSQL 16 (o compatible) localmente.
2. Crear la base y el usuario:
   ```
   psql -U postgres -c "CREATE DATABASE eco_sistema;"
   psql -U postgres -c "CREATE USER harry WITH PASSWORD 'tu-password';"
   ```
3. Restaurar el dump:
   ```
   psql -U harry -d eco_sistema -f db/eco_sistema_dump.sql
   ```
4. Copiar `.env.example` a `.env.local` y completar `DATABASE_URL` con las
   credenciales reales de esa máquina.

## Actualizar el dump

Cada vez que quieras sincronizar el backup con el estado actual de la base local:

```
"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -h 127.0.0.1 -p 5432 -U harry -d eco_sistema --no-owner --no-privileges -f db/eco_sistema_dump.sql
```

Después hacé `git add db/eco_sistema_dump.sql`, commit y push para dejarlo actualizado
en GitHub.

## Subir el dump a Supabase (nube)

El proyecto Supabase se usa como copia en la nube (ver `SUPABASE_DATABASE_URL` en
`.env.local`, connection string tipo "Session pooler" porque la red local no tiene
IPv6, que es lo que requiere la conexión directa). Para (re)poblarlo con el estado
actual de la base local:

```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -v ON_ERROR_STOP=1 -f db/eco_sistema_dump.sql "$SUPABASE_DATABASE_URL"
```

Por ahora esto es una carga manual de una sola vía (local → Supabase). Todavía no
existe un motor de sincronización automática ni bidireccional.
