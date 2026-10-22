import { Router } from 'express';
import type { Area } from '../../../frontend/src/api/types';
import { query } from '../db';
import { areaJson } from '../db/json';

export const areasRouter = Router();

areasRouter.get('/areas', async (_req, res) => {
  const rows = await query<{ item: Area }>(
    `SELECT ${areaJson('a')} AS item FROM areas a ORDER BY a.name COLLATE "C"`,
  );
  res.json(rows.map((r) => r.item));
});
