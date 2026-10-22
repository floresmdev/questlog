import { runner } from 'node-pg-migrate';
import pg from 'pg';

/**
 * Runs once before all test files: rebuilds the test database from scratch
 * with the real migrations, so tests always see exactly what production gets.
 */
export default async function setup() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is not set (see backend/.env.example)');

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await client.end();

  await runner({
    databaseUrl,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });
}
