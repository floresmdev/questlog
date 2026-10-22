import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFound } from './errors';
import { logger } from './logger';
import { healthRouter } from './routes/health';

/** Builds the Express app without listening, so tests can drive it with Supertest. */
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(pinoHttp({ logger }));

  const api = express.Router();
  api.use(healthRouter);
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
