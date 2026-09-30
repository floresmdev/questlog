import type { QuestlogApi } from './client';
import type { Area, Build, BuildHistoryItem, Id, LaneId, Task, TaskListItem, User } from './types';
import { areas } from '../mocks/areas';
import { builds, currentBuildId } from '../mocks/builds';
import { comments } from '../mocks/comments';
import { overviewActivity, taskActivity } from '../mocks/activity';
import { currentUserId, users } from '../mocks/users';
import { commentCounts, tasks } from '../mocks/tasks';
import {
  agenda,
  areaProgress,
  areaWorkload,
  buildHistoryCounts,
  deadlineLabels,
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

function toListItem(task: Task): TaskListItem {
  return {
    ...task,
    area: area(task.areaId),
    assignee: user(task.assigneeId),
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

  async getBoard(filters = {}) {
    const visible = tasks.filter(
      (t) =>
        (!filters.areaId || t.areaId === filters.areaId) &&
        (!filters.assigneeId || t.assigneeId === filters.assigneeId) &&
        (!filters.buildId || t.targetBuildId === filters.buildId || t.integratedBuildId === filters.buildId),
    );
    return LANES.map((id) => ({
      id,
      total: laneTotals[id],
      tasks: visible
        .filter((t) => laneOf(t) === id)
        .sort((a, b) => a.position - b.position)
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
        .map((c) => ({ ...c, author: user(c.authorId) })),
    };
  },

  async getTaskStats() {
    return taskStats;
  },
  async getPriorityStats() {
    return priorityStats;
  },
  async getAreaWorkload() {
    return areaWorkload.map((w) => ({ area: area(w.areaId), count: w.count }));
  },

  async getActivity(feed) {
    const rows = feed === 'tasks' ? taskActivity : overviewActivity;
    return rows.map(({ actorId, ...rest }) => ({ ...rest, actor: user(actorId) }));
  },

  async getOverviewStats() {
    const nextBuild = builds.find((b) => b.buildNumber === null) ?? null;
    return { ...overviewCounts, currentBuild: build(currentBuildId), nextBuild };
  },
  async getAreaProgress() {
    return areaProgress.map((p) => ({ area: area(p.areaId), done: p.done, total: p.total }));
  },
  async getWeeklyCompleted(weeks) {
    return weeklyCompleted.slice(-weeks);
  },
  async getAgenda() {
    return agenda.map(({ areaId, assigneeId, ...rest }) => ({
      ...rest,
      area: area(areaId),
      assignee: user(assigneeId),
    }));
  },

  async getCalendarEvents(from, to) {
    const inRange = (d: string | null): d is string => !!d && d >= from && d <= to;
    const released = builds.filter((b) => b.buildNumber !== null && inRange(b.releasedAt));
    const due = tasks.filter((t) => isOpen(t) && t.priority === 'high' && inRange(t.dueDate));
    return [
      ...released.map((b) => ({ date: b.releasedAt!, kind: 'build' as const })),
      ...due.map((t) => ({ date: t.dueDate, kind: 'due' as const })),
    ];
  },

  async getUpcomingDeadlines(limit) {
    const taskDeadlines = tasks
      .filter((t) => isOpen(t) && t.priority === 'high')
      .map((t) => ({
        id: t.id,
        kind: 'task' as const,
        label: deadlineLabels[t.id] ?? t.title,
        date: t.dueDate,
        detail: 'Alta',
      }));
    const buildDeadlines = builds
      .filter((b) => b.buildNumber === null && b.releasedAt)
      .map((b) => ({
        id: b.id,
        kind: 'build' as const,
        label: `Build ${b.version}`,
        date: b.releasedAt!,
        detail: 'Integración',
      }));
    // Stable sort keeps tasks ahead of builds on the same day.
    return [...taskDeadlines, ...buildDeadlines].sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
  },

  async getBuildHistory(limit) {
    return builds.slice(0, limit).map(
      (b): BuildHistoryItem => ({ build: b, ...buildHistoryCounts[b.id] }),
    );
  },
  async getDoneBreakdown() {
    return doneBreakdown;
  },
};
