import type { BoardLane, DoneBreakdown, Id, LaneId, PriorityStats, TaskStats, WeeklyCompletedPoint } from '../api/types';

// Aggregates the backend will compute with SQL. The board only ships a few
// cards per lane, so totals can't be derived from mocks/tasks.ts.

export const laneTotals: Record<LaneId, BoardLane['total']> = {
  pending: 19,
  in_progress: 14,
  done_active: 24,
  done_changed: 7,
};

export const taskStats: TaskStats = {
  total: 64,
  newThisWeek: 9,
  inProgress: 14,
  inProgressDueThisWeek: 5,
  done: 31,
  doneActive: 24,
  doneChanged: 7,
  sprint: { done: 48, inProgress: 22, pending: 30 },
};

export const priorityStats: PriorityStats = { high: 9, medium: 21, low: 34, highDueThisWeek: 3 };

/** Open tasks per area, descending. */
export const areaWorkload: { areaId: Id; count: number }[] = [
  { areaId: 'area-prog', count: 12 },
  { areaId: 'area-art', count: 9 },
  { areaId: 'area-design', count: 7 },
  { areaId: 'area-qa', count: 6 },
  { areaId: 'area-audio', count: 4 },
];

export const areaProgress: { areaId: Id; done: number; total: number }[] = [
  { areaId: 'area-prog', done: 8, total: 19 },
  { areaId: 'area-art', done: 8, total: 13 },
  { areaId: 'area-design', done: 6, total: 11 },
  { areaId: 'area-ui', done: 4, total: 8 },
  { areaId: 'area-audio', done: 3, total: 7 },
  { areaId: 'area-qa', done: 2, total: 6 },
];

export const overviewCounts = {
  pending: 19,
  inProgress: 14,
  done: 31,
  doneThisWeek: 6,
  teamSize: 7,
  areaCount: 6,
};

export const weeklyCompleted: WeeklyCompletedPoint[] = [
  { weekStart: '2026-08-03', count: 2 },
  { weekStart: '2026-08-10', count: 3 },
  { weekStart: '2026-08-17', count: 2 },
  { weekStart: '2026-08-24', count: 4 },
  { weekStart: '2026-08-31', count: 3 },
  { weekStart: '2026-09-07', count: 5 },
  { weekStart: '2026-09-14', count: 6 },
  { weekStart: '2026-09-21', count: 6 },
];

export const doneBreakdown: DoneBreakdown = { active: 24, modified: 5, removed: 2 };

export const buildHistoryCounts: Record<Id, { integrated: number; modified: number; removed: number; assigned: number }> = {
  'b-091': { integrated: 0, modified: 0, removed: 0, assigned: 4 },
  'b-090': { integrated: 6, modified: 1, removed: 1, assigned: 0 },
  'b-087': { integrated: 5, modified: 2, removed: 0, assigned: 0 },
  'b-085': { integrated: 4, modified: 0, removed: 1, assigned: 0 },
};

export const newInGameCount: Record<Id, number> = { 'b-090': 6 };

/** Today's agenda (times of day aren't in the schema yet). */
export const agenda = [
  { id: 'ag-1', title: 'Revisar colisiones del nivel 2', areaId: 'area-qa', assigneeId: 'u-lp', time: '09:00', done: true },
  { id: 'ag-2', title: 'Exportar sprites del jefe', areaId: 'area-art', assigneeId: 'u-mr', time: '11:30', done: true },
  { id: 'ag-3', title: 'Integrar pathfinding en la rama', areaId: 'area-prog', assigneeId: 'u-dr', time: '15:00', done: false },
  { id: 'ag-4', title: 'Playtest interno del nivel 2', areaId: 'area-design', assigneeId: 'u-st', time: '16:30', done: false },
  { id: 'ag-5', title: 'Mezcla de audio del nivel 1', areaId: 'area-audio', assigneeId: 'u-vg', time: '18:00', done: false },
];

/** Short labels for the "Próximas entregas" list. */
export const deadlineLabels: Record<Id, string> = {
  't-139': 'Crash en Switch',
  't-142': 'Pathfinding voladores',
};
