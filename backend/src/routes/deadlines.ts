import { Router } from 'express';
import type { Deadline } from '../../../frontend/src/api/types';
import { query } from '../db';
import { now } from '../time';
import { limit } from '../validate';

export const deadlinesRouter = Router();

/** Next open high-priority tasks and planned builds; on the same day, tasks first. */
deadlinesRouter.get('/deadlines', async (req, res) => {
  const rows = await query<Deadline>(
    `SELECT id, kind, label, date FROM (
       SELECT t.id, 'task' AS kind, t.title AS label, t.due_at::date AS date
         FROM tasks t
        WHERE t.status <> 'done' AND t.priority = 'high' AND t.due_at > $1::timestamptz
       UNION ALL
       SELECT b.id, 'build', b.version, b.planned_for
         FROM builds b
        WHERE b.released_at IS NULL AND b.planned_for >= $1::timestamptz::date
     ) d
     ORDER BY date, kind DESC, label COLLATE "C"
     LIMIT $2`,
    [now(), limit().parse(req.query.limit)],
  );
  res.json(rows);
});
