import { Router } from 'express';
import { z } from 'zod';
import type { ActivityItem } from '../../../frontend/src/api/types';
import { query } from '../db';
import { userJson } from '../db/json';
import { limit } from '../validate';

export const activityRouter = Router();

const activityQuery = z.object({ scope: z.enum(['tasks', 'all']), limit: limit() });

/** Newest events first. 'tasks' = task changes only (no comments, no build releases). */
activityRouter.get('/activity', async (req, res) => {
  const q = activityQuery.parse(req.query);
  const rows = await query<{ item: ActivityItem }>(
    `SELECT json_build_object(
              'id', l.id, 'action', l.action, 'payload', l.payload, 'createdAt', l.created_at,
              'actor', ${userJson('u')},
              'task', CASE WHEN t.id IS NULL THEN NULL
                           ELSE json_build_object('id', t.id, 'code', t.code, 'title', t.title) END
            ) AS item
       FROM activity_log l
       JOIN users u ON u.id = l.actor_id
       LEFT JOIN tasks t ON t.id = l.task_id
      WHERE $1 = 'all' OR (l.task_id IS NOT NULL AND l.action <> 'comment.created')
      ORDER BY l.created_at DESC
      LIMIT $2`,
    [q.scope, q.limit],
  );
  res.json(rows.map((r) => r.item));
});
