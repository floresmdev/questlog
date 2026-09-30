/**
 * Domain types mirroring the data model in docs/HANDOFF.md §3.
 * Column names are camelCased; dates are ISO strings as they come over JSON.
 */

export type Id = string;
/** `YYYY-MM-DD` */
export type ISODate = string;
/** Full ISO 8601 timestamp */
export type ISODateTime = string;

// ── Enums ────────────────────────────────────────────────────────────────────

export type AreaColorKey =
  | 'programming'
  | 'art'
  | 'design'
  | 'audio'
  | 'uiux'
  | 'qa'
  | 'animation'
  | 'narrative';

export type UserRole = 'admin' | 'member';
export type AvatarColor = 'blue' | 'violet' | 'pink' | 'teal' | 'orange' | 'red' | 'slate';
export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type DoneState = 'active' | 'modified' | 'removed';
export type Priority = 'high' | 'medium' | 'low';

// ── Tables ───────────────────────────────────────────────────────────────────

export interface Area {
  id: Id;
  name: string;
  colorKey: AreaColorKey;
}

/** `users` row as exposed by the API (password_hash never leaves the backend). */
export interface User {
  id: Id;
  email: string;
  fullName: string;
  role: UserRole;
  initials: string;
  avatarColor: AvatarColor;
  /**
   * Display title ("Producer", "QA", "CEO"). Not in the §3 schema yet, but the
   * sidebar and comment headers show it — proposed `users.job_title`.
   */
  jobTitle: string | null;
  createdAt: ISODateTime;
}

export interface Build {
  id: Id;
  version: string;
  /** null while the build is still being prepared (no CI number yet). */
  buildNumber: number | null;
  /** Release date, or the planned date when `buildNumber` is null. */
  releasedAt: ISODate | null;
  notes: string;
}

export interface Task {
  id: Id;
  code: string; // 'QL-###'
  title: string;
  description: string;
  areaId: Id;
  assigneeId: Id;
  status: TaskStatus;
  /** Required when status = 'done', null otherwise. */
  doneState: DoneState | null;
  changeNote: string | null;
  priority: Priority;
  startDate: ISODate;
  dueDate: ISODate;
  completedAt: ISODateTime | null;
  targetBuildId: Id | null;
  integratedBuildId: Id | null;
  position: number;
  createdBy: Id;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Comment {
  id: Id;
  taskId: Id;
  authorId: Id;
  body: string;
  createdAt: ISODateTime;
}

export interface ActivityLog {
  id: Id;
  taskId: Id | null;
  actorId: Id;
  action: string;
  payload: Record<string, unknown>;
  createdAt: ISODateTime;
}

// ── API read models (joined / aggregated responses) ──────────────────────────

/** A task joined with the rows a card needs. */
export interface TaskListItem extends Task {
  area: Area;
  assignee: User;
  targetBuild: Build | null;
  integratedBuild: Build | null;
  commentCount: number;
}

export interface CommentWithAuthor extends Comment {
  author: User;
}

export interface TaskDetail extends TaskListItem {
  /** Most recent comments, oldest first. `commentCount` has the full total. */
  comments: CommentWithAuthor[];
}

export type LaneId = 'pending' | 'in_progress' | 'done_active' | 'done_changed';

export interface BoardLane {
  id: LaneId;
  total: number;
  tasks: TaskListItem[];
}

export interface BoardFilters {
  areaId?: Id;
  assigneeId?: Id;
  buildId?: Id;
}

export interface CurrentBuild {
  build: Build;
  newInGameCount: number;
}

export interface TaskStats {
  total: number;
  newThisWeek: number;
  inProgress: number;
  inProgressDueThisWeek: number;
  done: number;
  doneActive: number;
  doneChanged: number;
  /** Sprint split in whole percentages. */
  sprint: { done: number; inProgress: number; pending: number };
}

export interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  highDueThisWeek: number;
}

export interface AreaCount {
  area: Area;
  count: number;
}

export interface AreaProgressItem {
  area: Area;
  done: number;
  total: number;
}

export interface OverviewStats {
  pending: number;
  inProgress: number;
  done: number;
  doneThisWeek: number;
  currentBuild: Build;
  nextBuild: Build | null;
  teamSize: number;
  areaCount: number;
}

export interface WeeklyCompletedPoint {
  weekStart: ISODate;
  count: number;
}

export type HighlightTone = 'progress' | 'danger' | 'success';

/**
 * A rendered activity_log entry. The wording differs per screen in the design,
 * so for now the copy comes pre-rendered; the backend phase decides whether
 * text is built server- or client-side from `action` + `payload`.
 */
export interface ActivityItem {
  id: Id;
  actor: User;
  createdAt: ISODateTime;
  text: string;
  highlight?: { text: string; tone: HighlightTone };
}

/** An item on today's agenda (the schema has no time-of-day; proposed `tasks.due_time`). */
export interface AgendaItem {
  id: Id;
  title: string;
  area: Area;
  assignee: User;
  time: string; // 'HH:mm'
  done: boolean;
}

export type CalendarEventKind = 'build' | 'due';

export interface CalendarEvent {
  date: ISODate;
  kind: CalendarEventKind;
}

export interface Deadline {
  id: Id;
  kind: 'task' | 'build';
  label: string;
  date: ISODate;
  /** "Alta" for tasks, "Integración" for builds. */
  detail: string;
}

export interface BuildHistoryItem {
  build: Build;
  integrated: number;
  modified: number;
  removed: number;
  /** For builds in preparation: tasks targeting it. */
  assigned: number;
}

export interface DoneBreakdown {
  active: number;
  modified: number;
  removed: number;
}
