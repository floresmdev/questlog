import { Router } from 'express';
import { pool } from '../db';

export const healthRouter = Router();

// 200 only if the database answers: Docker healthchecks, uptime monitoring and
// the deploy script all rely on this meaning "the API can actually serve".
healthRouter.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    req.log.warn({ err }, 'health check: database unreachable');
    res.status(503).json({ status: 'unavailable' });
  }
});
