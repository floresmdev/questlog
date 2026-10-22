import pg, { type QueryResultRow } from 'pg';
import { config } from './config';

// DATE columns stay 'YYYY-MM-DD' strings. By default pg turns them into JS
// Dates at local midnight, which can shift the day depending on the server TZ.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  // Session timezone: `timestamptz::date` and `date_trunc` count days and
  // weeks in the studio's timezone, not the server's.
  options: `-c TimeZone=${config.APP_TIMEZONE}`,
});

/** Runs a parameterized query ($1, $2…) and returns the rows. Never interpolate values into SQL. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
