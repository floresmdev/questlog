import { Router } from 'express';
import { z } from 'zod';
import type { BoardLane, LaneId, TaskListItem } from '../../../frontend/src/api/types';
import { query } from '../db';
import { LANE_SQL, TASK_LIST_JOINS, taskListJson } from '../db/json';
import { limit, uuid } from '../validate';

export const boardRouter = Router();

const LANES: LaneId[] = ['pending', 'in_progress', 'done_active', 'done_changed'];

const boardQuery = z.object({
  areaId: uuid.optional(),
  assigneeId: uuid.optional(),
  buildId: uuid.optional(),
  perLane: limit().default(4),
});

/**
 * The four Kanban lanes: the first `perLane` cards of each (by position) plus
 * the lane's full count, for "Ver N más".
 */
boardRouter.get('/board', async (req, res) => {
  const q = boardQuery.parse(req.query);
  const rows = await query<{ lane: LaneId; total: number; item: TaskListItem | null }>(
    `WITH visible AS (
       SELECT t.id, t.position, t.code, ${LANE_SQL} AS lane
         FROM tasks t
        WHERE ($1::uuid IS NULL OR t.area_id = $1)
          AND ($2::uuid IS NULL OR t.assignee_id = $2)
          AND ($3::uuid IS NULL OR $3 IN (t.target_build_id, t.integrated_build_id))
     ), ranked AS (
       SELECT v.*,
              row_number() OVER (PARTITION BY lane ORDER BY position, code COLLATE "C") AS rn,
              count(*) OVER (PARTITION BY lane)::int AS total
         FROM visible v
     )
     SELECT r.lane, r.total, ${taskListJson} AS item
       FROM ranked r
       JOIN tasks t ON t.id = r.id
       ${TASK_LIST_JOINS}
      WHERE r.rn <= $4
      ORDER BY r.rn`,
    [q.areaId ?? null, q.assigneeId ?? null, q.buildId ?? null, q.perLane],
  );

  const lanes: BoardLane[] = LANES.map((id) => {
    const laneRows = rows.filter((r) => r.lane === id);
    return {
      id,
      total: laneRows[0]?.total ?? 0,
      tasks: laneRows.map((r) => r.item!),
    };
  });
  res.json(lanes);
});
