import { Router } from 'express';
import type { CalendarEvent } from '../../../frontend/src/api/types';
import { query } from '../db';
import { isoDate } from '../validate';

export const calendarRouter = Router();

/** Calendar dots: released builds and open high-priority deadlines between two days. */
calendarRouter.get('/calendar', async (req, res) => {
  const rows = await query<CalendarEvent>(
    `SELECT date, kind FROM (
       SELECT b.released_at::date AS date, 'build' AS kind
         FROM builds b
        WHERE b.released_at IS NOT NULL
       UNION ALL
       SELECT t.due_at::date, 'due'
         FROM tasks t
        WHERE t.status <> 'done' AND t.priority = 'high' AND t.due_at IS NOT NULL
     ) e
     WHERE date BETWEEN $1::date AND $2::date
     ORDER BY date, kind`,
    [isoDate.parse(req.query.from), isoDate.parse(req.query.to)],
  );
  res.json(rows);
});
