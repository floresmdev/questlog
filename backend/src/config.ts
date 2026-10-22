import { z } from 'zod';

const timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, 'must be an IANA timezone, e.g. America/Mexico_City');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** Timezone used for "today", calendar days and week buckets. */
  APP_TIMEZONE: timezone.default('America/Mexico_City'),
  /** Freezes "now" (dev/test) so stats match the seeded data. Unset in production. */
  APP_NOW: z.iso.datetime({ offset: true }).optional(),
  /** Stand-in for the logged-in user until phase 2b adds sessions. */
  DEV_USER_EMAIL: z.email(),
});

export type Config = z.infer<typeof schema>;

function load(): Config {
  // `KEY=` in an env file or `KEY: ${UNSET}` in compose arrives as "": treat it as unset.
  const env = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''));
  const result = schema.safeParse(env);
  if (!result.success) {
    // Fail fast at startup with every problem listed, instead of on the first request.
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const config = load();
