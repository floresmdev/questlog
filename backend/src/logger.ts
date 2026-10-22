import { pino } from 'pino';
import { config } from './config';

// JSON logs (one object per line) in production so they can be shipped and
// parsed; human-readable output in development.
export const logger = pino({
  level: config.LOG_LEVEL,
  transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
