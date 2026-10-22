import type { QuestlogApi } from './client';
import type { Area, Build, Id, LaneId, Task, TaskListItem, User } from './types';
import { activity } from '../mocks/activity';
import { areas } from '../mocks/areas';
import { builds } from '../mocks/builds';
import { comments } from '../mocks/comments';
import { tasks } from '../mocks/tasks';
import { currentUserId, users } from '../mocks/users';
import { APP_NOW, APP_TIMEZONE } from '../lib/now';

// Every number here is computed from the mock rows with the same rules as the
// backend's SQL, so mock mode and http mode render the same screens.

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
    commentCount: comments.filter((c) => c.taskId === task.id).length,
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
const isChanged = (t: Task) => t.doneState === 'modified' || t.doneState === 'removed';

// ── Time rules (backend: APP_NOW + APP_TIMEZONE) ─────────────────────────────

const DAY_MS = 86_400_000;
const NOW = APP_NOW.getTime();
const ms = (ts: string) => new Date(ts).getTime();

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE });
/** `YYYY-MM-DD` of an instant, in the studio's timezone. */
const localDate = (ts: string) => dayFormat.format(new Date(ts));
const TODAY = localDate(APP_NOW.toISOString());

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
/** Monday of the week containing `date`. */
const mondayOf = (date: string) =>
  addDays(date, -((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7));

/** Happened in the last 7 days (rolling). */
const inLastWeek = (ts: string | null) => !!ts && ms(ts) > NOW - 7 * DAY_MS && ms(ts) <= NOW;
/** Due from the start of today up to 7 days from now. */
const dueThisWeek = (t: Task) =>
  !!t.dueAt && localDate(t.dueAt) >= TODAY && ms(t.dueAt) <= NOW + 7 * DAY_MS;

const pct = (part: number, total: number) => (total ? Math.round((part * 100) / total) : 0);
/** Plain code-point order, like `COLLATE "C"` in SQL. */
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Newest first: released builds by release, planned ones by target date. */
const buildDate = (b: Build) => ms(b.releasedAt ?? `${b.plannedFor}T00:00:00-06:00`);
const sortedBuilds = () => [...builds].sort((a, b) => buildDate(b) - buildDate(a));
const currentBuild = () => sortedBuilds().find((b) => b.releasedAt !== null)!;
const nextBuild = () =>
  builds
    .filter((b) => b.releasedAt === null && b.plannedFor)
    .sort((a, b) => byText(a.plannedFor!, b.plannedFor!))[0] ?? null;

function areaCounts(rows: Task[]) {
  return areas
    .map((a) => ({ area: a, rows: rows.filter((t) => t.areaId === a.id) }))
    .filter((x) => x.rows.length > 0);
}

// ── Implementation ───────────────────────────────────────────────────────────

export const mockApi: QuestlogApi = {
  async getCurrentUser() {
    return user(currentUserId);
  },
  async getUsers() {
    return [...users].sort((a, b) => byText(a.fullName, b.fullName));
  },
  async getAreas() {
    return [...areas].sort((a, b) => byText(a.name, b.name));
  },
  async getBuilds() {
    return sortedBuilds();
  },
  async getCurrentBuild() {
    const b = currentBuild();
    const newInGameCount = tasks.filter(
      (t) => t.integratedBuildId === b.id && t.doneState === 'active',
    ).length;
    return { build: b, newInGameCount };
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
    return LANES.map((id) => {
      const lane = visible
        .filter((t) => laneOf(t) === id)
        .sort((a, b) => a.position - b.position || byText(a.code, b.code));
      return { id, total: lane.length, tasks: lane.slice(0, perLane).map(toListItem) };
    });
  },

  async getTask(id) {
    const task = byId(tasks, id, 'task');
    return {
      ...toListItem(task),
      comments: comments
        .filter((c) => c.taskId === id)
        .sort((a, b) => ms(a.createdAt) - ms(b.createdAt))
        .slice(-2)
        .map((c) => ({ ...c, author: user(c.authorId) })),
    };
  },

  async getTaskStats() {
    const count = (f: (t: Task) => boolean) => tasks.filter(f).length;
    const total = tasks.length;
    const pending = count((t) => t.status === 'pending');
    const inProgress = count((t) => t.status === 'in_progress');
    const done = count((t) => t.status === 'done');
    return {
      total,
      newThisWeek: count((t) => inLastWeek(t.createdAt)),
      inProgress,
      inProgressDueThisWeek: count((t) => t.status === 'in_progress' && dueThisWeek(t)),
      done,
      doneActive: count((t) => t.doneState === 'active'),
      doneChanged: count(isChanged),
      sprint: {
        done: pct(done, total),
        inProgress: pct(inProgress, total),
        pending: pct(pending, total),
      },
    };
  },
  async getPriorityStats() {
    const count = (f: (t: Task) => boolean) => tasks.filter(f).length;
    return {
      high: count((t) => t.priority === 'high'),
      medium: count((t) => t.priority === 'medium'),
      low: count((t) => t.priority === 'low'),
      highDueThisWeek: count((t) => isOpen(t) && t.priority === 'high' && dueThisWeek(t)),
    };
  },
  async getAreaWorkload(limit) {
    return areaCounts(tasks.filter(isOpen))
      .map((x) => ({ area: x.area, count: x.rows.length }))
      .sort((a, b) => b.count - a.count || byText(a.area.name, b.area.name))
      .slice(0, limit);
  },

  async getActivity(scope, limit) {
    return activity
      .filter((a) => scope === 'all' || (a.taskId !== null && a.action !== 'comment.created'))
      .sort((a, b) => ms(b.createdAt) - ms(a.createdAt))
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
    const count = (f: (t: Task) => boolean) => tasks.filter(f).length;
    return {
      pending: count((t) => t.status === 'pending'),
      inProgress: count((t) => t.status === 'in_progress'),
      done: count((t) => t.status === 'done'),
      doneThisWeek: count((t) => inLastWeek(t.completedAt)),
      currentBuild: currentBuild(),
      nextBuild: nextBuild(),
      teamSize: users.filter((u) => u.isActive && u.role === 'member').length,
      areaCount: areas.length,
    };
  },
  async getAreaProgress(limit) {
    return areaCounts(tasks)
      .map((x) => ({
        area: x.area,
        done: x.rows.filter((t) => t.status === 'done').length,
        total: x.rows.length,
      }))
      .sort((a, b) => b.total - a.total || byText(a.area.name, b.area.name))
      .slice(0, limit);
  },
  async getWeeklyCompleted(weeks) {
    // The last `weeks` full weeks (Monday start), oldest first; the current week is excluded.
    const thisMonday = mondayOf(TODAY);
    return Array.from({ length: weeks }, (_, i) => {
      const weekStart = addDays(thisMonday, -7 * (weeks - i));
      const weekEnd = addDays(weekStart, 7);
      const count = tasks.filter((t) => {
        if (!t.completedAt) return false;
        const day = localDate(t.completedAt);
        return day >= weekStart && day < weekEnd;
      }).length;
      return { weekStart, count };
    });
  },
  async getAgenda(date) {
    return tasks
      .filter((t) => t.dueAt && localDate(t.dueAt) === date)
      .sort((a, b) => ms(a.dueAt!) - ms(b.dueAt!) || byText(a.code, b.code))
      .map((t) => ({
        id: t.id,
        title: t.title,
        area: area(t.areaId),
        assignee: userOrNull(t.assigneeId),
        dueAt: t.dueAt!,
        done: t.status === 'done',
      }));
  },

  async getCalendarEvents(from, to) {
    const inRange = (d: string) => d >= from && d <= to;
    const released = builds
      .filter((b) => b.releasedAt && inRange(localDate(b.releasedAt)))
      .map((b) => ({ date: localDate(b.releasedAt!), kind: 'build' as const }));
    const due = tasks
      .filter((t) => isOpen(t) && t.priority === 'high' && t.dueAt && inRange(localDate(t.dueAt)))
      .map((t) => ({ date: localDate(t.dueAt!), kind: 'due' as const }));
    return [...released, ...due].sort((a, b) => byText(a.date, b.date) || byText(a.kind, b.kind));
  },

  async getUpcomingDeadlines(limit) {
    const taskDeadlines = tasks
      .filter((t) => isOpen(t) && t.priority === 'high' && t.dueAt && ms(t.dueAt) > NOW)
      .map((t) => ({ id: t.id, kind: 'task' as const, label: t.title, date: localDate(t.dueAt!) }));
    const buildDeadlines = builds
      .filter((b) => b.releasedAt === null && b.plannedFor && b.plannedFor >= TODAY)
      .map((b) => ({ id: b.id, kind: 'build' as const, label: b.version, date: b.plannedFor! }));
    // Same day: tasks before builds.
    return [...taskDeadlines, ...buildDeadlines]
      .sort((a, b) => byText(a.date, b.date) || byText(b.kind, a.kind) || byText(a.label, b.label))
      .slice(0, limit);
  },

  async getBuildHistory(limit) {
    return sortedBuilds()
      .slice(0, limit)
      .map((b) => {
        const integrated = tasks.filter((t) => t.integratedBuildId === b.id);
        return {
          build: b,
          integrated: integrated.filter((t) => t.doneState === 'active').length,
          modified: integrated.filter((t) => t.doneState === 'modified').length,
          removed: integrated.filter((t) => t.doneState === 'removed').length,
          assigned: tasks.filter((t) => isOpen(t) && t.targetBuildId === b.id).length,
        };
      });
  },
  async getDoneBreakdown() {
    const count = (state: Task['doneState']) => tasks.filter((t) => t.doneState === state).length;
    return { active: count('active'), modified: count('modified'), removed: count('removed') };
  },
};
