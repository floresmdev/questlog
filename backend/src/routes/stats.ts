import { Router } from 'express';
import type {
  AreaCount,
  AreaProgressItem,
  DoneBreakdown,
  OverviewStats,
  PriorityStats,
  TaskStats,
  WeeklyCompletedPoint,
} from '../../../frontend/src/api/types';
import { query } from '../db';
import { areaJson, buildJson } from '../db/json';
import { now } from '../time';
import { limit } from '../validate';

export const statsRouter = Router();

// Shared definitions ($1 = now). "This week" is rolling: the last 7 days for
// things that happened, today through 7 days ahead for things that are due.
// Days are counted in the session timezone (APP_TIMEZONE, see db.ts).
const IN_LAST_WEEK = (col: string) =>
  `${col} > $1::timestamptz - interval '7 days' AND ${col} <= $1::timestamptz`;
const DUE_THIS_WEEK = `t.due_at::date >= $1::timestamptz::date
  AND t.due_at <= $1::timestamptz + interval '7 days'`;
/** Whole percentage of the total; 0 when there are no tasks. */
const pct = (part: string) => `coalesce(round(${part} * 100.0 / nullif(count(*), 0)), 0)::int`;

statsRouter.get('/stats/tasks', async (_req, res) => {
  const [row] = await query<TaskStats>(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE ${IN_LAST_WEEK('t.created_at')})::int AS "newThisWeek",
            count(*) FILTER (WHERE t.status = 'in_progress')::int AS "inProgress",
            count(*) FILTER (WHERE t.status = 'in_progress' AND ${DUE_THIS_WEEK})::int
              AS "inProgressDueThisWeek",
            count(*) FILTER (WHERE t.status = 'done')::int AS done,
            count(*) FILTER (WHERE t.done_state = 'active')::int AS "doneActive",
            count(*) FILTER (WHERE t.done_state IN ('modified', 'removed'))::int AS "doneChanged",
            json_build_object(
              'done', ${pct(`count(*) FILTER (WHERE t.status = 'done')`)},
              'inProgress', ${pct(`count(*) FILTER (WHERE t.status = 'in_progress')`)},
              'pending', ${pct(`count(*) FILTER (WHERE t.status = 'pending')`)}) AS sprint
       FROM tasks t`,
    [now()],
  );
  res.json(row);
});

statsRouter.get('/stats/priorities', async (_req, res) => {
  const [row] = await query<PriorityStats>(
    `SELECT count(*) FILTER (WHERE t.priority = 'high')::int AS high,
            count(*) FILTER (WHERE t.priority = 'medium')::int AS medium,
            count(*) FILTER (WHERE t.priority = 'low')::int AS low,
            count(*) FILTER (WHERE t.priority = 'high' AND t.status <> 'done' AND ${DUE_THIS_WEEK})::int
              AS "highDueThisWeek"
       FROM tasks t`,
    [now()],
  );
  res.json(row);
});

/** Open tasks per area, busiest first. */
statsRouter.get('/stats/area-workload', async (req, res) => {
  const rows = await query<AreaCount>(
    `SELECT ${areaJson('a')} AS area, count(*)::int AS count
       FROM tasks t
       JOIN areas a ON a.id = t.area_id
      WHERE t.status <> 'done'
      GROUP BY a.id
      ORDER BY count DESC, a.name COLLATE "C"
      LIMIT $1`,
    [limit().parse(req.query.limit)],
  );
  res.json(rows);
});

statsRouter.get('/stats/overview', async (_req, res) => {
  const [row] = await query<OverviewStats>(
    `SELECT count(*) FILTER (WHERE t.status = 'pending')::int AS pending,
            count(*) FILTER (WHERE t.status = 'in_progress')::int AS "inProgress",
            count(*) FILTER (WHERE t.status = 'done')::int AS done,
            count(*) FILTER (WHERE ${IN_LAST_WEEK('t.completed_at')})::int AS "doneThisWeek",
            (SELECT ${buildJson('b')} FROM builds b
              WHERE b.released_at IS NOT NULL
              ORDER BY b.released_at DESC LIMIT 1) AS "currentBuild",
            (SELECT ${buildJson('b')} FROM builds b
              WHERE b.released_at IS NULL AND b.planned_for IS NOT NULL
              ORDER BY b.planned_for LIMIT 1) AS "nextBuild",
            (SELECT count(*)::int FROM users u
              WHERE u.is_active AND u.role = 'member') AS "teamSize",
            (SELECT count(*)::int FROM areas) AS "areaCount"
       FROM tasks t`,
    [now()],
  );
  res.json(row);
});

/** Done / total per area, biggest areas first. */
statsRouter.get('/stats/area-progress', async (req, res) => {
  const rows = await query<AreaProgressItem>(
    `SELECT ${areaJson('a')} AS area,
            count(*) FILTER (WHERE t.status = 'done')::int AS done,
            count(*)::int AS total
       FROM tasks t
       JOIN areas a ON a.id = t.area_id
      GROUP BY a.id
      ORDER BY total DESC, a.name COLLATE "C"
      LIMIT $1`,
    [limit().parse(req.query.limit)],
  );
  res.json(rows);
});

/** Tasks completed in each of the last N full weeks (Monday start); the current week is excluded. */
statsRouter.get('/stats/weekly-completed', async (req, res) => {
  const rows = await query<WeeklyCompletedPoint>(
    `WITH weeks AS (
       SELECT generate_series(
                date_trunc('week', $1::timestamptz) - $2 * interval '1 week',
                date_trunc('week', $1::timestamptz) - interval '1 week',
                interval '1 week') AS week_start
     )
     SELECT w.week_start::date AS "weekStart", count(t.id)::int AS count
       FROM weeks w
       LEFT JOIN tasks t
         ON t.completed_at >= w.week_start AND t.completed_at < w.week_start + interval '1 week'
      GROUP BY w.week_start
      ORDER BY w.week_start`,
    [now(), limit(52).parse(req.query.weeks)],
  );
  res.json(rows);
});

statsRouter.get('/stats/done-breakdown', async (_req, res) => {
  const [row] = await query<DoneBreakdown>(
    `SELECT count(*) FILTER (WHERE t.done_state = 'active')::int AS active,
            count(*) FILTER (WHERE t.done_state = 'modified')::int AS modified,
            count(*) FILTER (WHERE t.done_state = 'removed')::int AS removed
       FROM tasks t`,
  );
  res.json(row);
});
