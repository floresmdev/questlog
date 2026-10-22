import pg from 'pg';
import { seedDatabase } from './seed-data';

// `npm run seed`: wipes the tables and loads the dev dataset.
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV=production (the seed deletes all data).');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await seedDatabase(client);
  const { rows } = await client.query<{ tasks: number; comments: number }>(
    'SELECT (SELECT count(*) FROM tasks)::int AS tasks, (SELECT count(*) FROM comments)::int AS comments',
  );
  console.log(`Seeded ${rows[0].tasks} tasks and ${rows[0].comments} comments.`);
} finally {
  await client.end();
}
