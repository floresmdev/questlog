import { Router } from 'express';
import type { TaskDetail } from '../../../frontend/src/api/types';
import { query } from '../db';
import { TASK_LIST_JOINS, taskListJson, userJson } from '../db/json';
import { HttpError } from '../errors';
import { uuid } from '../validate';

export const tasksRouter = Router();

/** How many recent comments the detail panel shows ("Ver todos" for the rest). */
const DETAIL_COMMENTS = 2;

tasksRouter.get('/tasks/:id', async (req, res) => {
  const id = uuid.parse(req.params.id);
  const [row] = await query<{ item: TaskDetail }>(
    `SELECT (${taskListJson})::jsonb || jsonb_build_object('comments', coalesce((
              SELECT json_agg(x.item ORDER BY x.created_at)
                FROM (SELECT c.created_at,
                             json_build_object(
                               'id', c.id, 'taskId', c.task_id, 'authorId', c.author_id,
                               'body', c.body, 'createdAt', c.created_at,
                               'author', ${userJson('cu')}) AS item
                        FROM comments c
                        JOIN users cu ON cu.id = c.author_id
                       WHERE c.task_id = t.id
                       ORDER BY c.created_at DESC
                       LIMIT $2) x), '[]')) AS item
       FROM tasks t
       ${TASK_LIST_JOINS}
      WHERE t.id = $1`,
    [id, DETAIL_COMMENTS],
  );
  if (!row) throw new HttpError(404, 'Task not found');
  res.json(row.item);
});
