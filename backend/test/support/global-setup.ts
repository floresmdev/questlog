import { runner } from 'node-pg-migrate';
import pg from 'pg';
import { seedDatabase } from '../../src/db/seed-data';

/**
 * Runs once before all test files: rebuilds the test database from scratch
 * with the real migrations (exactly what production gets), then loads the
 * dev dataset that the frontend mocks also use.
 */
export default async function setup() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is not set (see backend/.env.example)');

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await runner({
      databaseUrl,
      dir: 'migrations',
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: () => {},
    });
    await seedDatabase(client);
  } finally {
    await client.end();
  }
}
