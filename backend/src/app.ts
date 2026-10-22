import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFound } from './errors';
import { logger } from './logger';
import { areasRouter } from './routes/areas';
import { buildsRouter } from './routes/builds';
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';

/** Builds the Express app without listening, so tests can drive it with Supertest. */
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(pinoHttp({ logger }));

  const api = express.Router();
  api.use(healthRouter, usersRouter, areasRouter, buildsRouter);
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
