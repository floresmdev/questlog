import { Router } from 'express';
import type { AgendaItem } from '../../../frontend/src/api/types';
import { query } from '../db';
import { areaJson, orNull, userJson } from '../db/json';
import { isoDate } from '../validate';

export const agendaRouter = Router();

/** Tasks due on a given day (studio timezone), by time of day. */
agendaRouter.get('/agenda', async (req, res) => {
  const rows = await query<{ item: AgendaItem }>(
    `SELECT json_build_object(
              'id', t.id, 'title', t.title, 'area', ${areaJson('a')},
              'assignee', ${orNull('u', userJson('u'))},
              'dueAt', t.due_at, 'done', t.status = 'done') AS item
       FROM tasks t
       JOIN areas a ON a.id = t.area_id
       LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.due_at::date = $1::date
      ORDER BY t.due_at, t.code COLLATE "C"`,
    [isoDate.parse(req.query.date)],
  );
  res.json(rows.map((r) => r.item));
});
