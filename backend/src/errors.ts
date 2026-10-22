import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, _res, next) => next(new HttpError(404, 'Not found'));

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Invalid request', details: z.flattenError(err).fieldErrors });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Unexpected: log the details, return nothing internal to the client.
  req.log.error({ err }, 'unhandled error');
  res.status(500).json({ error: 'Internal server error' });
};
