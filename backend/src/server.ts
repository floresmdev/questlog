import { createApp } from './app';
import { config } from './config';
import { pool } from './db';
import { logger } from './logger';

const server = createApp().listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'api listening');
});

// `docker compose stop` sends SIGTERM and waits 10 s before SIGKILL. Finish
// in-flight requests and close DB connections instead of dying mid-request.
function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(() => {
    pool.end().then(() => process.exit(0));
  });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
