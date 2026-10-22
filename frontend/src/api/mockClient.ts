import type { QuestlogApi } from './client';
import type { Area, Build, BuildHistoryItem, Id, LaneId, Task, TaskListItem, User } from './types';
import { areas } from '../mocks/areas';
import { builds, currentBuildId } from '../mocks/builds';
import { comments } from '../mocks/comments';
import { activity } from '../mocks/activity';
import { currentUserId, users } from '../mocks/users';
import { commentCounts, tasks } from '../mocks/tasks';
import {
  agenda,
  areaProgress,
  areaWorkload,
  buildHistoryCounts,
  doneBreakdown,
  laneTotals,
  newInGameCount,
  overviewCounts,
  priorityStats,
  taskStats,
  weeklyCompleted,
} from '../mocks/dashboard';

// ── Lookups (stand-ins for SQL joins) ────────────────────────────────────────

function byId<T extends { id: Id }>(rows: T[], id: Id, table: string): T {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`${table} ${id} not found`);
  return row;
}

const area = (id: Id): Area => byId(areas, id, 'area');
const user = (id: Id): User => byId(users, id, 'user');
const build = (id: Id): Build => byId(builds, id, 'build');
const buildOrNull = (id: Id | null) => (id ? build(id) : null);
const userOrNull = (id: Id | null) => (id ? user(id) : null);

function toListItem(task: Task): TaskListItem {
  return {
    ...task,
    area: area(task.areaId),
    assignee: userOrNull(task.assigneeId),
    targetBuild: buildOrNull(task.targetBuildId),
    integratedBuild: buildOrNull(task.integratedBuildId),
    commentCount: commentCounts[task.id] ?? 0,
  };
}

/** Lanes are derived from status + done_state (HANDOFF §3). */
function laneOf(task: Task): LaneId {
  if (task.status === 'pending') return 'pending';
  if (task.status === 'in_progress') return 'in_progress';
  return task.doneState === 'active' ? 'done_active' : 'done_changed';
}

const LANES: LaneId[] = ['pending', 'in_progress', 'done_active', 'done_changed'];
const isOpen = (t: Task) => t.status !== 'done';

// ── Implementation ───────────────────────────────────────────────────────────

export const mockApi: QuestlogApi = {
  async getCurrentUser() {
    return user(currentUserId);
  },
  async getUsers() {
    return users;
  },
  async getAreas() {
    return areas;
  },
  async getBuilds() {
    return builds;
  },
  async getCurrentBuild() {
    return { build: build(currentBuildId), newInGameCount: newInGameCount[currentBuildId] ?? 0 };
  },

  async getBoard(filters = {}, perLane = 4) {
    const visible = tasks.filter(
      (t) =>
        (!filters.areaId || t.areaId === filters.areaId) &&
        (!filters.assigneeId || t.assigneeId === filters.assigneeId) &&
        (!filters.buildId ||
          t.targetBuildId === filters.buildId ||
          t.integratedBuildId === filters.buildId),
    );
    return LANES.map((id) => ({
      id,
      total: laneTotals[id],
      tasks: visible
        .filter((t) => laneOf(t) === id)
        .sort((a, b) => a.position - b.position)
        .slice(0, perLane)
        .map(toListItem),
    }));
  },

  async getTask(id) {
    const task = byId(tasks, id, 'task');
    return {
      ...toListItem(task),
      comments: comments
        .filter((c) => c.taskId === id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(-2)
        .map((c) => ({ ...c, author: user(c.authorId) })),
    };
  },

  async getTaskStats() {
    return taskStats;
  },
  async getPriorityStats() {
    return priorityStats;
  },
  async getAreaWorkload(limit) {
    return areaWorkload.slice(0, limit).map((w) => ({ area: area(w.areaId), count: w.count }));
  },

  async getActivity(scope, limit) {
    return activity
      .filter((a) => scope === 'all' || a.taskId !== null)
      .filter((a) => scope === 'all' || a.action !== 'comment.created')
      .slice(0, limit)
      .map(({ actorId, taskId, ...rest }) => {
        const task = taskId ? byId(tasks, taskId, 'task') : null;
        return {
          ...rest,
          actor: user(actorId),
          task: task && { id: task.id, code: task.code, title: task.title },
        };
      });
  },

  async getOverviewStats() {
    const nextBuild = builds.find((b) => b.buildNumber === null) ?? null;
    return { ...overviewCounts, currentBuild: build(currentBuildId), nextBuild };
  },
  async getAreaProgress(limit) {
    return areaProgress
      .slice(0, limit)
      .map((p) => ({ area: area(p.areaId), done: p.done, total: p.total }));
  },
  async getWeeklyCompleted(weeks) {
    return weeklyCompleted.slice(-weeks);
  },
  async getAgenda() {
    return agenda.map(({ areaId, assigneeId, ...rest }) => ({
      ...rest,
      area: area(areaId),
      assignee: userOrNull(assigneeId),
    }));
  },

  async getCalendarEvents(from, to) {
    const inRange = (d: string | null): d is string => !!d && d >= from && d <= to;
    const day = (ts: string | null) => ts && ts.slice(0, 10);
    const released = builds.filter((b) => inRange(day(b.releasedAt)));
    const due = tasks.filter((t) => isOpen(t) && t.priority === 'high' && inRange(day(t.dueAt)));
    return [
      ...released.map((b) => ({ date: day(b.releasedAt)!, kind: 'build' as const })),
      ...due.map((t) => ({ date: day(t.dueAt)!, kind: 'due' as const })),
    ];
  },

  async getUpcomingDeadlines(limit) {
    const taskDeadlines = tasks
      .filter((t) => isOpen(t) && t.priority === 'high')
      .map((t) => ({
        id: t.id,
        kind: 'task' as const,
        label: t.title,
        date: t.dueAt!.slice(0, 10),
      }));
    const buildDeadlines = builds
      .filter((b) => b.releasedAt === null && b.plannedFor)
      .map((b) => ({
        id: b.id,
        kind: 'build' as const,
        label: b.version,
        date: b.plannedFor!,
      }));
    // Stable sort keeps tasks ahead of builds on the same day.
    return [...taskDeadlines, ...buildDeadlines]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  },

  async getBuildHistory(limit) {
    return builds
      .slice(0, limit)
      .map((b): BuildHistoryItem => ({ build: b, ...buildHistoryCounts[b.id] }));
  },
  async getDoneBreakdown() {
    return doneBreakdown;
  },
};
