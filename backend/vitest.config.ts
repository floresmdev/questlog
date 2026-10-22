import { defineConfig } from 'vitest/config';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on variables set in the shell (e.g. CI).
}

// Tests run against TEST_DATABASE_URL (a separate database), never the dev one.
const env = process.env;

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      DATABASE_URL: env.TEST_DATABASE_URL ?? '',
      APP_TIMEZONE: 'America/Mexico_City',
      APP_NOW: '2026-09-28T16:20:00-06:00',
      DEV_USER_EMAIL: 'gonzalo@questlog.dev',
    },
    // One database: test files must not run in parallel against it.
    fileParallelism: false,
  },
});
