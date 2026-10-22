import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFound } from './errors';
import { logger } from './logger';
import { activityRouter } from './routes/activity';
import { agendaRouter } from './routes/agenda';
import { areasRouter } from './routes/areas';
import { boardRouter } from './routes/board';
import { buildsRouter } from './routes/builds';
import { calendarRouter } from './routes/calendar';
import { deadlinesRouter } from './routes/deadlines';
import { healthRouter } from './routes/health';
import { statsRouter } from './routes/stats';
import { tasksRouter } from './routes/tasks';
import { usersRouter } from './routes/users';

/** Builds the Express app without listening, so tests can drive it with Supertest. */
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(pinoHttp({ logger }));

  const api = express.Router();
  api.use(
    healthRouter,
    usersRouter,
    areasRouter,
    buildsRouter,
    boardRouter,
    tasksRouter,
    statsRouter,
    activityRouter,
    agendaRouter,
    calendarRouter,
    deadlinesRouter,
  );
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
