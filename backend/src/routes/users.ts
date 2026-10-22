import { Router } from 'express';
import type { User } from '../../../frontend/src/api/types';
import { config } from '../config';
import { query } from '../db';
import { userJson } from '../db/json';
import { HttpError } from '../errors';

export const usersRouter = Router();

// Until phase 2b adds sessions, "me" is the user named by DEV_USER_EMAIL.
usersRouter.get('/me', async (_req, res) => {
  const [row] = await query<{ item: User }>(
    `SELECT ${userJson('u')} AS item FROM users u WHERE u.email = $1`,
    [config.DEV_USER_EMAIL],
  );
  if (!row) throw new HttpError(404, 'Current user not found');
  res.json(row.item);
});

usersRouter.get('/users', async (_req, res) => {
  const rows = await query<{ item: User }>(
    `SELECT ${userJson('u')} AS item FROM users u ORDER BY u.full_name COLLATE "C"`,
  );
  res.json(rows.map((r) => r.item));
});
