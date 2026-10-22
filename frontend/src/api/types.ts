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
  'programming' | 'art' | 'design' | 'audio' | 'uiux' | 'qa' | 'animation' | 'narrative';

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
  /** Display title ("Producer", "QA", "CEO") shown in the sidebar and comments. */
  jobTitle: string | null;
  isActive: boolean;
  createdAt: ISODateTime;
}

export interface Build {
  id: Id;
  version: string;
  /** null while the build is still being prepared (no CI number yet). */
  buildNumber: number | null;
  /** Target date of a build in preparation. */
  plannedFor: ISODate | null;
  /** null until the build is released. */
  releasedAt: ISODateTime | null;
  notes: string;
}

export interface Task {
  id: Id;
  code: string; // 'QL-###'
  title: string;
  description: string;
  areaId: Id;
  assigneeId: Id | null;
  status: TaskStatus;
  /** Required when status = 'done', null otherwise. */
  doneState: DoneState | null;
  changeNote: string | null;
  priority: Priority;
  startDate: ISODate | null;
  /** Exact due instant; the agenda shows its time of day. */
  dueAt: ISODateTime | null;
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
  assignee: User | null;
  targetBuild: Build | null;
  integratedBuild: Build | null;
  commentCount: number;
}

export interface CommentWithAuthor extends Comment {
  author: User;
}

export interface TaskDetail extends TaskListItem {
  /** Up to the 2 most recent comments, oldest first. `commentCount` has the full total. */
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

export type BuildRef = Pick<Build, 'id' | 'version' | 'buildNumber'>;
export type TaskRef = Pick<Task, 'id' | 'code' | 'title'>;

/**
 * Structured `activity_log` events. The server only stores facts; the client
 * turns them into Spanish sentences (`lib/activity.ts`). Build details are a
 * snapshot taken when the event happened.
 */
export type ActivityEvent =
  | { action: 'task.moved'; payload: { from: TaskStatus; to: TaskStatus } }
  | { action: 'task.priority_changed'; payload: { from: Priority; to: Priority } }
  | { action: 'task.completed'; payload: { doneState: DoneState; build: BuildRef | null } }
  | { action: 'comment.created'; payload: Record<string, never> }
  | { action: 'build.released'; payload: { build: BuildRef } };

export type ActivityAction = ActivityEvent['action'];

/** An `activity_log` row joined with its actor and (optional) task. */
export type ActivityItem = ActivityEvent & {
  id: Id;
  actor: User;
  task: TaskRef | null;
  createdAt: ISODateTime;
};

/** Feed scope: 'tasks' = task changes only (Tareas), 'all' = every event (Overview). */
export type ActivityScope = 'tasks' | 'all';

/** A task due on the requested day. */
export interface AgendaItem {
  id: Id;
  title: string;
  area: Area;
  assignee: User | null;
  dueAt: ISODateTime;
  done: boolean;
}

export type CalendarEventKind = 'build' | 'due';

export interface CalendarEvent {
  date: ISODate;
  kind: CalendarEventKind;
}

/** An upcoming open high-priority task or a planned build. */
export interface Deadline {
  id: Id;
  kind: 'task' | 'build';
  /** Task title, or the build version. */
  label: string;
  date: ISODate;
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
