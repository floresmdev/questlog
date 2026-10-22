import { Router } from 'express';
import type { Build, BuildHistoryItem, CurrentBuild } from '../../../frontend/src/api/types';
import { query } from '../db';
import { BUILD_ORDER, buildJson } from '../db/json';
import { HttpError } from '../errors';
import { limit } from '../validate';

export const buildsRouter = Router();

buildsRouter.get('/builds', async (_req, res) => {
  const rows = await query<{ item: Build }>(
    `SELECT ${buildJson('b')} AS item FROM builds b ORDER BY ${BUILD_ORDER}`,
  );
  res.json(rows.map((r) => r.item));
});

/** The latest released build and how many tasks went into the game with it. */
buildsRouter.get('/builds/current', async (_req, res) => {
  const [row] = await query<CurrentBuild>(
    `SELECT ${buildJson('b')} AS build,
            (SELECT count(*)::int FROM tasks t
              WHERE t.integrated_build_id = b.id AND t.done_state = 'active') AS "newInGameCount"
       FROM builds b
      WHERE b.released_at IS NOT NULL
      ORDER BY b.released_at DESC
      LIMIT 1`,
  );
  if (!row) throw new HttpError(404, 'No released build yet');
  res.json(row);
});

/** Timeline: what each build integrated, or how many open tasks target a planned one. */
buildsRouter.get('/builds/history', async (req, res) => {
  const rows = await query<BuildHistoryItem>(
    `SELECT ${buildJson('b')} AS build,
            count(*) FILTER (WHERE t.integrated_build_id = b.id AND t.done_state = 'active')::int
              AS integrated,
            count(*) FILTER (WHERE t.integrated_build_id = b.id AND t.done_state = 'modified')::int
              AS modified,
            count(*) FILTER (WHERE t.integrated_build_id = b.id AND t.done_state = 'removed')::int
              AS removed,
            count(*) FILTER (WHERE t.target_build_id = b.id AND t.status <> 'done')::int AS assigned
       FROM builds b
       LEFT JOIN tasks t ON b.id IN (t.integrated_build_id, t.target_build_id)
      GROUP BY b.id
      ORDER BY ${BUILD_ORDER}
      LIMIT $1`,
    [limit().parse(req.query.limit)],
  );
  res.json(rows);
});
